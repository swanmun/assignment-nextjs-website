import "server-only";

import { formatWon, getCancelBlockReason, PAYMENT_TYPE } from "@/lib/payment-rules";
import type { OrderHistory, OrderHistoryItem } from "@/lib/types";
import type { ProductRow } from "./product";
import { createSupabaseServerClient } from "./server";
import { productImageUrl } from "./storage";

/** 상품 종류 컬럼이 아직 없어 모든 상품을 같은 배지로 보여 준다. */
const PRODUCT_KIND = "강연·모임";

const METHOD_LABEL: Record<string, string> = {
  PaymentMethodCard: "신용카드",
  PaymentMethodEasyPay: "간편결제",
  PaymentMethodTransfer: "계좌이체",
  PaymentMethodVirtualAccount: "가상계좌",
  PaymentMethodMobile: "휴대폰",
};

type LedgerRow = {
  transaction_key: string;
  type: string;
  /** numeric은 문자열로 온다. 결제 +, 취소 − */
  amount: string | number;
  product_id: string;
  created_at: string;
  product_snapshot: {
    snapshot_product: Partial<ProductRow> | null;
    snapshot_payment: { paidAt?: string | null; method?: string | null } | null;
  } | null;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 한국 시간 기준 날짜 조각 */
const kstParts = (iso: string) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  const weekday = WEEKDAYS[["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday)];
  return { date: `${parts.month}.${parts.day}`, weekday, time: `${parts.hour}:${parts.minute}` };
};

/** "11.21(토) 11:00" */
const formatEventAt = (iso: string) => {
  const { date, weekday, time } = kstParts(iso);
  return `${date}(${weekday}) ${time}`;
};

/** "11.03" */
const formatDay = (iso: string) => kstParts(iso).date;

/** 스냅숏(결제 시점 상품)으로 공통 표시값을 만든다. 상품이 나중에 바뀌어도 결제 당시 정보를 보여 준다. */
const toBase = (row: LedgerRow) => {
  const product = row.product_snapshot?.snapshot_product ?? {};
  const title = product.name?.replace(/\s+/g, " ").trim() || "강연·모임";
  const schedule = [product.event_at ? formatEventAt(product.event_at) : "일정 미정", product.address].filter(Boolean).join(" · ");
  const imagePath = product.image_path_detail_md ?? product.image_path_main_md;
  const base = {
    key: row.transaction_key,
    href: `/products/${row.product_id}`,
    imageUrl: imagePath ? productImageUrl(imagePath) : "",
    imageAlt: title,
    kind: PRODUCT_KIND,
    title,
    schedule,
  };
  return { base, eventAt: product.event_at ?? null };
};

/**
 * 로그인 회원의 결제 내역·취소 내역 (rules/payment.md › 결제 내역).
 * RLS(payment_select_own·product_snapshot_select_own)로 본인 행만 읽힌다.
 */
export async function listMyOrders(): Promise<OrderHistory> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("payment")
    .select("transaction_key, type, amount, product_id, created_at, product_snapshot(snapshot_product, snapshot_payment)")
    .order("created_at", { ascending: false })
    .returns<LedgerRow[]>();
  if (error) throw new Error(`결제 내역을 불러오지 못했어요: ${error.message}`);

  // transaction_key로 결제·취소 행을 묶는다.
  const paidByKey = new Map<string, LedgerRow>();
  const cancelledRows: LedgerRow[] = [];
  for (const row of data) {
    if (row.type === PAYMENT_TYPE.paid) paidByKey.set(row.transaction_key, row);
    else if (row.type === PAYMENT_TYPE.cancelled) cancelledRows.push(row);
  }
  const cancelledKeys = new Set(cancelledRows.map((row) => row.transaction_key));
  const now = Date.now();

  // 결제 내역: 취소되지 않은 결제, 최신 결제순
  const paid: OrderHistoryItem[] = [...paidByKey.values()]
    .filter((row) => !cancelledKeys.has(row.transaction_key))
    .map((row) => {
      const { base, eventAt } = toBase(row);
      const snapshotPayment = row.product_snapshot?.snapshot_payment;
      const method = snapshotPayment?.method ? METHOD_LABEL[snapshotPayment.method] : undefined;
      // 환불 규정(rules/payment.md › 결제 취소). BFF도 같은 함수로 다시 판단한다.
      const blockReason = getCancelBlockReason(eventAt, now);
      return {
        ...base,
        status: blockReason ? "paid-locked" : "paid",
        amount: formatWon(Number(row.amount)),
        amountDetail: [`${formatDay(snapshotPayment?.paidAt ?? row.created_at)} 결제`, method].filter(Boolean).join(" · "),
        ...(blockReason && { lockedReason: blockReason }),
      };
    });

  // 취소 내역: 최신 취소순. 환불 금액은 취소 행의 −금액, 원래 결제 금액은 같은 키의 결제 행
  const cancelled: OrderHistoryItem[] = cancelledRows.map((row) => {
    const original = paidByKey.get(row.transaction_key);
    const { base } = toBase(original ?? row);
    const refund = Math.abs(Number(row.amount));
    return {
      ...base,
      status: "canceled",
      amount: `환불 ${formatWon(refund)}`,
      amountDetail: [original && `결제 ${formatWon(Number(original.amount))}`, `${formatDay(row.created_at)} 취소`].filter(Boolean).join(" · "),
    };
  });

  return { paid, cancelled };
}
