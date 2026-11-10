"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { Empty } from "@/components/empty/Empty";
import { Icon } from "@/components/icon/Icon";
import { Modal } from "@/components/modal/Modal";
import { OrderItem } from "@/components/order-item/OrderItem";
import type { ToastType } from "@/components/toast/Toast";
import { Window, WindowWell } from "@/components/window/Window";
import { formatWon, type PaymentCancelResult } from "@/lib/payment-rules";
import { requestJson } from "@/lib/request-json";
import type { OrderHistoryItem } from "@/lib/types";
import page from "../../_components/page.module.css";

type OrderHistoryWindowProps = {
  kind: "paid" | "cancelled";
  items: OrderHistoryItem[];
  /** 결제 취소 결과 안내 토스트 */
  onNotify?: (type: ToastType, message: string) => void;
  /** 탭 패널 연결용 */
  id?: string;
  labelledBy?: string;
};

type CancelResponse = PaymentCancelResult | { pending: true; message: string };

const COPY = {
  paid: { title: "C:\\구로\\결제 내역", label: "결제 내역", order: "최신 결제순" },
  cancelled: { title: "C:\\구로\\취소 내역", label: "취소 내역", order: "최신 취소순" },
} as const;

/** 마이 페이지 결제 내역·취소 내역 탭 (rules/payment.md › 결제 내역·결제 취소) */
export const OrderHistoryWindow = ({ kind, items, onNotify, id, labelledBy }: OrderHistoryWindowProps) => {
  const router = useRouter();
  const copy = COPY[kind];
  /** [결제 취소]를 눌러 확인 중인 결제 */
  const [confirming, setConfirming] = useState<OrderHistoryItem | null>(null);
  const [cancelling, setCancelling] = useState(false);

  /** BFF(POST /api/payments/:id/cancel)가 포트원 전액 취소 후 기록한다. 성공하면 서버 데이터를 다시 읽어 취소 내역으로 옮긴다. */
  const cancelPayment = async (item: OrderHistoryItem) => {
    if (cancelling) return;
    setCancelling(true);
    try {
      const result = await requestJson<CancelResponse>(
        `/api/payments/${item.key}/cancel`,
        { method: "POST" },
        "결제를 취소하지 못했어요.",
      );
      setConfirming(null);
      if ("pending" in result) onNotify?.("info", result.message);
      else onNotify?.("success", `결제를 취소했어요. ${formatWon(result.refundAmount)}이 환불돼요.`);
      router.refresh();
    } catch (error) {
      setConfirming(null);
      onNotify?.("error", (error as Error).message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div role="tabpanel" id={id} aria-labelledby={labelledBy}>
      <Window
        title={copy.title}
        icon={<FolderOpen size={14} />}
        minimizable
        toolbar={
          <span className="typo-label-md">
            {copy.label} {items.length}건{items.length > 0 && ` · ${copy.order}`}
          </span>
        }
        status={[`${items.length} / ${items.length} 표시`]}
      >
        <WindowWell>
          {items.length === 0 ? (
            kind === "paid" ? (
              <Empty
                visual="calendar"
                title="아직 신청한 강연·모임이 없어요"
                description="메인 배너에서 열리는 강연·모임을 둘러보세요."
                primaryAction={{ label: "둘러보기", leftIcon: "home", onClick: () => router.push("/") }}
              />
            ) : (
              <Empty visual="refresh" title="취소한 내역이 없어요" />
            )
          ) : (
            <>
              <ul className={page.cardGrid}>
                {items.map(({ key, ...item }) => (
                  <li key={key}>
                    <OrderItem {...item} onCancel={item.status === "paid" ? () => setConfirming({ key, ...item }) : undefined} />
                  </li>
                ))}
              </ul>
              <p className={`${page.listFooter} typo-label-md`}>
                <Icon name="check" size={16} />
                마지막 내역이에요
              </p>
            </>
          )}
        </WindowWell>
      </Window>

      <Modal
        open={confirming !== null}
        onClose={() => !cancelling && setConfirming(null)}
        title="정말 취소할까요?"
        secondaryAction={{ label: "닫기", disabled: cancelling, onClick: () => setConfirming(null) }}
        primaryAction={{
          label: "결제 취소",
          loading: cancelling,
          disabled: cancelling,
          onClick: () => confirming && cancelPayment(confirming),
        }}
      >
        {confirming && `'${confirming.title}' 결제를 취소하면 환불 금액 ${confirming.amount}이 결제한 카드로 돌아가요.`}
      </Modal>
    </div>
  );
};
