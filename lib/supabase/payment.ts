import "server-only";

import type { Payment } from "@portone/server-sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCancelBlockReason,
  PAYMENT_CANCEL_REASON,
  PAYMENT_CURRENCY,
  PAYMENT_TYPE,
  type PaymentCancelResult,
  type PaymentCompleteResult,
  type PaymentCustomData,
  toLedgerAmount,
  toOrderName,
} from "@/lib/payment-rules";
import { cancelPortonePayment, fetchPortonePayment, getPortoneEnv } from "@/lib/portone";
import { getProductRow, productPrice } from "./product";
import { createSupabaseAdminClient, createSupabaseServerClient } from "./server";

/** 결제 처리에서 사용자에게 보여 줄 실패 이유. 4xx는 다시 시도해도 결과가 같다. */
export class PaymentCompleteError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** PostgreSQL unique_violation */
const UNIQUE_VIOLATION = "23505";

const SAVE_FAILED = "결제 내역을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";

const parseCustomData = (raw: string | undefined): PaymentCustomData | null => {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<PaymentCustomData>;
    return typeof data.productId === "string" && typeof data.userId === "string"
      ? { productId: data.productId, userId: data.userId }
      : null;
  } catch {
    return null;
  }
};

/** 결제 기록 스냅숏: 그 시점의 PortOne 결제 정보(재조회·CS 대응용) */
const toPaymentSnapshot = (payment: Payment.PaidPayment) => ({
  paymentId: payment.id,
  transactionId: payment.transactionId,
  status: payment.status,
  orderName: payment.orderName,
  amount: payment.amount,
  currency: payment.currency,
  method: payment.method?.type ?? null,
  channel: payment.channel ? { type: payment.channel.type, pgProvider: payment.channel.pgProvider } : null,
  paidAt: payment.paidAt,
  pgTxId: payment.pgTxId ?? null,
  receiptUrl: payment.receiptUrl ?? null,
});

type RecordedPaid = PaymentCompleteResult & { userId: string };

/** 이미 기록된 결제 완료 행. 없으면 null */
async function findRecordedPaid(db: SupabaseClient, paymentId: string): Promise<RecordedPaid | null> {
  const { data, error } = await db
    .from("payment")
    .select("user_id, product_id, amount, product_snapshot(snapshot_product)")
    .eq("transaction_key", paymentId)
    .eq("type", PAYMENT_TYPE.paid)
    .maybeSingle<{
      user_id: string;
      product_id: string;
      amount: string | number;
      product_snapshot: { snapshot_product: { name?: string | null } | null } | null;
    }>();
  if (error) throw new Error(`결제 기록을 읽지 못했어요: ${error.message}`);
  if (!data) return null;
  return {
    paymentId,
    userId: data.user_id,
    productId: data.product_id,
    orderName: toOrderName(data.product_snapshot?.snapshot_product?.name ?? ""),
    amount: Number(data.amount),
  };
}

/** 같은 회원이 같은 상품을 이미 결제(취소 안 됨)한 다른 결제 번호들. 중복 결제 감지용 */
async function findOtherActivePaid(db: SupabaseClient, userId: string, productId: string, paymentId: string) {
  const { data, error } = await db
    .from("payment")
    .select("transaction_key, type")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .returns<{ transaction_key: string; type: string }[]>();
  if (error) throw new Error(`결제 기록을 읽지 못했어요: ${error.message}`);
  const cancelled = new Set(data.filter((row) => row.type === PAYMENT_TYPE.cancelled).map((row) => row.transaction_key));
  return data
    .filter((row) => row.type === PAYMENT_TYPE.paid && row.transaction_key !== paymentId && !cancelled.has(row.transaction_key))
    .map((row) => row.transaction_key);
}

const ensureOwner = (recorded: RecordedPaid, expectedUserId?: string) => {
  if (expectedUserId && recorded.userId !== expectedUserId) {
    throw new PaymentCompleteError("다른 계정으로 결제한 내역이에요.", 403);
  }
};

const toResult = ({ paymentId, productId, orderName, amount }: RecordedPaid): PaymentCompleteResult => ({
  paymentId,
  productId,
  orderName,
  amount,
});

/**
 * 결제 완료 검증·기록 (rules/payment.md › 결제 완료 검증·중복 결제).
 * 결제 완료 페이지 BFF와 웹훅이 함께 쓴다. paymentId만 믿고 나머지는 PortOne 서버 조회와 DB 상품으로 검증한다.
 * 같은 paymentId가 몇 번, 어느 경로로, 동시에 들어와도 PAID 행은 하나만 생긴다.
 *
 * @param expectedUserId 결제 완료 페이지에서 부를 때 로그인 회원 id. 웹훅은 세션이 없어 넘기지 않는다(customData.userId를 쓴다).
 */
export async function recordPaidPayment(paymentId: string, expectedUserId?: string): Promise<PaymentCompleteResult> {
  if (!UUID.test(paymentId)) throw new PaymentCompleteError("올바르지 않은 결제 번호예요.", 400);
  const db = createSupabaseAdminClient();

  // 1. 이미 기록한 결제면 그대로 돌려준다(새로고침·웹훅 재전송·웹훅과 완료 페이지 중복).
  const recorded = await findRecordedPaid(db, paymentId);
  if (recorded) {
    ensureOwner(recorded, expectedUserId);
    return toResult(recorded);
  }

  // 2. PortOne 서버에서 실제 결제 상태를 확인한다.
  const payment = await fetchPortonePayment(paymentId);
  if (!payment) throw new PaymentCompleteError("결제 정보를 찾지 못했어요.", 404);
  if (payment.status !== "PAID") throw new PaymentCompleteError("결제가 완료되지 않았어요.", 409);

  // 3. 상점·주문자·상품·금액이 모두 맞는지 확인한다.
  const customData = parseCustomData(payment.customData);
  if (payment.storeId !== getPortoneEnv().storeId || !customData) {
    throw new PaymentCompleteError("결제 정보가 올바르지 않아요.", 400);
  }
  if (expectedUserId && customData.userId !== expectedUserId) {
    throw new PaymentCompleteError("다른 계정으로 결제한 내역이에요.", 403);
  }

  const product = await getProductRow(customData.productId);
  const price = product ? productPrice(product) : null;
  if (!product || price === null) {
    console.error("[payment] 판매 중이 아닌 상품의 결제", { paymentId, productId: customData.productId });
    throw new PaymentCompleteError("판매 중인 상품이 아니에요.", 409);
  }
  if (payment.amount.total !== price || payment.currency !== PAYMENT_CURRENCY || payment.orderName !== toOrderName(product.name ?? "")) {
    // 위·변조 의심. 기록하지 않는다. 자동 환불은 결제 취소 기능에서 다룬다.
    console.error("[payment] 결제 금액·주문명 불일치", { paymentId, total: payment.amount.total, price });
    throw new PaymentCompleteError("결제 금액이 상품 가격과 달라요. 고객센터로 문의해 주세요.", 409);
  }

  // 4. 같은 상품 중복 결제 감지. 돈은 이미 나갔으므로 기록은 하고(원장은 실제 거래를 그대로 남긴다) 로그로 알린다.
  const duplicates = await findOtherActivePaid(db, customData.userId, product.id, paymentId);
  if (duplicates.length > 0) {
    console.warn("[payment] 같은 상품 중복 결제", { paymentId, userId: customData.userId, productId: product.id, duplicates });
  }

  // 5. 스냅숏 → 결제 기록.
  const snapshotId = crypto.randomUUID();
  const { error: snapshotError } = await db.from("product_snapshot").insert({
    id: snapshotId,
    snapshot_product: product,
    snapshot_payment: toPaymentSnapshot(payment),
  });
  if (snapshotError) {
    console.error("[payment] 스냅숏 저장 실패", snapshotError);
    throw new PaymentCompleteError(SAVE_FAILED, 500);
  }

  const { error: paymentError } = await db.from("payment").insert({
    transaction_key: paymentId,
    type: PAYMENT_TYPE.paid,
    amount: toLedgerAmount(PAYMENT_TYPE.paid, payment.amount.total),
    product_id: product.id,
    user_id: customData.userId,
    payment_snapshot_id: snapshotId,
  });

  if (paymentError?.code === UNIQUE_VIOLATION) {
    // 동시에 들어온 같은 결제(웹훅·완료 페이지)가 먼저 기록했다. 내 스냅숏은 버리고 먼저 기록된 행을 돌려준다.
    await db.from("product_snapshot").delete().eq("id", snapshotId);
    const winner = await findRecordedPaid(db, paymentId);
    if (!winner) throw new PaymentCompleteError(SAVE_FAILED, 500);
    ensureOwner(winner, expectedUserId);
    return toResult(winner);
  }
  if (paymentError) {
    console.error("[payment] 결제 기록 저장 실패", paymentError);
    await db.from("product_snapshot").delete().eq("id", snapshotId);
    throw new PaymentCompleteError(SAVE_FAILED, 500);
  }

  return { paymentId, productId: product.id, orderName: toOrderName(product.name ?? ""), amount: payment.amount.total };
}

/** 결제 완료 페이지 BFF용: 로그인 회원 본인의 결제만 처리한다. */
export async function completePayment(paymentId: string): Promise<PaymentCompleteResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new PaymentCompleteError("로그인이 필요해요.", 401);
  return recordPaidPayment(paymentId, user.id);
}

/** 결제 행 하나(취소 처리용). 스냅숏의 상품 정보까지 */
type LedgerRow = {
  user_id: string;
  product_id: string;
  amount: string | number;
  product_snapshot: { snapshot_product: { event_at?: string | null } | null } | null;
};

async function findLedgerRow(db: SupabaseClient, paymentId: string, type: string): Promise<LedgerRow | null> {
  const { data, error } = await db
    .from("payment")
    .select("user_id, product_id, amount, product_snapshot(snapshot_product)")
    .eq("transaction_key", paymentId)
    .eq("type", type)
    .maybeSingle<LedgerRow>();
  if (error) throw new Error(`결제 기록을 읽지 못했어요: ${error.message}`);
  return data;
}

/** 취소 기록 스냅숏: 취소 시점의 PortOne 결제 정보 */
const toCancelSnapshot = (payment: Payment.CancelledPayment, refundAmount: number) => ({
  paymentId: payment.id,
  transactionId: payment.transactionId,
  status: payment.status,
  orderName: payment.orderName,
  amount: payment.amount,
  currency: payment.currency,
  refundAmount,
  cancelledAt: payment.cancelledAt,
  cancellations: payment.cancellations.map((cancellation) => ({
    id: "id" in cancellation ? cancellation.id : null,
    status: cancellation.status,
    totalAmount: "totalAmount" in cancellation ? cancellation.totalAmount : null,
    reason: "reason" in cancellation ? cancellation.reason : null,
    cancelledAt: "cancelledAt" in cancellation ? (cancellation.cancelledAt ?? null) : null,
  })),
});

/**
 * 결제 취소 기록 (rules/payment.md › 결제 취소 웹훅 1·2·4·5·6). 취소 BFF가 쓰고, 취소 웹훅도 같은 함수를 쓴다.
 * PortOne에서 실제로 전액 취소된 결제만 CANCELLED 행(−금액)으로 남긴다. 몇 번 불려도 행은 하나다.
 */
export async function recordCancelledPayment(paymentId: string): Promise<PaymentCancelResult> {
  if (!UUID.test(paymentId)) throw new PaymentCompleteError("올바르지 않은 결제 번호예요.", 400);
  const db = createSupabaseAdminClient();

  // 1. 이미 기록했으면 끝(멱등)
  const recorded = await findLedgerRow(db, paymentId, PAYMENT_TYPE.cancelled);
  if (recorded) return { paymentId, refundAmount: Math.abs(Number(recorded.amount)) };

  const paid = await findLedgerRow(db, paymentId, PAYMENT_TYPE.paid);
  if (!paid) throw new PaymentCompleteError("결제 내역을 찾지 못했어요.", 404);
  const paidAmount = Number(paid.amount);

  // 2. PortOne에서 전액 취소됐는지 확인
  const payment = await fetchPortonePayment(paymentId);
  if (!payment) throw new PaymentCompleteError("결제 정보를 찾지 못했어요.", 404);
  if (payment.status !== "CANCELLED" || payment.storeId !== getPortoneEnv().storeId) {
    throw new PaymentCompleteError("결제가 취소되지 않았어요.", 409);
  }

  // 3. 성공한 취소 금액 합 = 결제 금액 (전액 취소만)
  const refundAmount = payment.cancellations.reduce(
    (sum, cancellation) => (cancellation.status === "SUCCEEDED" ? sum + cancellation.totalAmount : sum),
    0,
  );
  if (refundAmount !== paidAmount) {
    console.error("[payment] 취소 금액 불일치", { paymentId, refundAmount, paidAmount });
    throw new PaymentCompleteError("취소 금액이 결제 금액과 달라요. 고객센터로 문의해 주세요.", 409);
  }

  // 4. 스냅숏 → CANCELLED 행. 상품 정보는 결제 당시 스냅숏을 그대로 쓴다.
  const snapshotId = crypto.randomUUID();
  const { error: snapshotError } = await db.from("product_snapshot").insert({
    id: snapshotId,
    snapshot_product: paid.product_snapshot?.snapshot_product ?? null,
    snapshot_payment: toCancelSnapshot(payment, refundAmount),
  });
  if (snapshotError) {
    console.error("[payment] 취소 스냅숏 저장 실패", snapshotError);
    throw new PaymentCompleteError(SAVE_FAILED, 500);
  }

  const { error: cancelError } = await db.from("payment").insert({
    transaction_key: paymentId,
    type: PAYMENT_TYPE.cancelled,
    amount: toLedgerAmount(PAYMENT_TYPE.cancelled, refundAmount),
    product_id: paid.product_id,
    user_id: paid.user_id,
    payment_snapshot_id: snapshotId,
  });
  if (cancelError) {
    await db.from("product_snapshot").delete().eq("id", snapshotId);
    // 5. 동시에 들어온 같은 취소(두 번 클릭·취소 웹훅)가 먼저 기록했으면 성공
    if (cancelError.code === UNIQUE_VIOLATION) return { paymentId, refundAmount };
    console.error("[payment] 취소 기록 저장 실패", cancelError);
    throw new PaymentCompleteError(SAVE_FAILED, 500);
  }

  return { paymentId, refundAmount };
}

/** 취소 요청은 접수됐지만 아직 환불이 끝나지 않음(비동기 취소). 기록은 취소 웹훅이 한다. */
export class PaymentCancelPendingError extends PaymentCompleteError {
  constructor() {
    super("취소 요청을 접수했어요. 처리가 끝나면 취소 내역으로 옮겨져요.", 202);
  }
}

/**
 * 마이 페이지 결제 취소 BFF용 (rules/payment.md › 결제 취소).
 * 로그인 회원 본인의 결제만, 환불 규정 안에서, 전액 취소한다. 여러 번 눌러도 한 번만 취소·기록된다.
 */
export async function cancelMyPayment(paymentId: string): Promise<PaymentCancelResult> {
  if (!UUID.test(paymentId)) throw new PaymentCompleteError("올바르지 않은 결제 번호예요.", 400);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new PaymentCompleteError("로그인이 필요해요.", 401);

  // 1. 본인 결제인지
  const db = createSupabaseAdminClient();
  const paid = await findLedgerRow(db, paymentId, PAYMENT_TYPE.paid);
  if (!paid) throw new PaymentCompleteError("결제 내역을 찾지 못했어요.", 404);
  if (paid.user_id !== user.id) throw new PaymentCompleteError("다른 계정으로 결제한 내역이에요.", 403);

  // 2. 이미 취소했으면 그대로 성공(멱등)
  const cancelled = await findLedgerRow(db, paymentId, PAYMENT_TYPE.cancelled);
  if (cancelled) return { paymentId, refundAmount: Math.abs(Number(cancelled.amount)) };

  // 3. 환불 규정
  const blockReason = getCancelBlockReason(paid.product_snapshot?.snapshot_product?.event_at);
  if (blockReason) throw new PaymentCompleteError(blockReason, 409);

  // 4. PortOne 전액 취소. 잔액 검증으로 이중 환불을 막는다.
  const outcome = await cancelPortonePayment(paymentId, Number(paid.amount), PAYMENT_CANCEL_REASON);
  if (outcome.kind === "failed") throw new PaymentCompleteError(outcome.message, outcome.status);
  if (outcome.kind === "requested") throw new PaymentCancelPendingError();

  // 5. 기록 (succeeded·already-cancelled)
  return recordCancelledPayment(paymentId);
}
