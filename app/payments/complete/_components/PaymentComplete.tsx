"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Empty } from "@/components/empty/Empty";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { formatWon, type PaymentCompleteResult } from "@/lib/payment-rules";

type State =
  | { status: "verifying" }
  | { status: "paid"; result: PaymentCompleteResult }
  | { status: "failed"; message: string };

export type PaymentCompleteProps = {
  /** PortOne이 돌려준 결제 번호 */
  paymentId: string | null;
  /** 결제창에서 실패·취소했으면 PortOne이 준 메시지 */
  failure: string | null;
};

/** 결제 결과를 BFF(POST /api/payments/complete)로 검증·기록하고 결과를 보여 준다. */
export const PaymentComplete = ({ paymentId, failure }: PaymentCompleteProps) => {
  const router = useRouter();
  const [state, setState] = useState<State>(() =>
    failure || !paymentId ? { status: "failed", message: failure ?? "결제 정보가 없어요." } : { status: "verifying" },
  );

  useEffect(() => {
    if (failure || !paymentId) return;
    let ignore = false;
    (async () => {
      const response = await fetch("/api/payments/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      }).catch(() => null);
      const body = (await response?.json().catch(() => null)) as (PaymentCompleteResult & { message?: string }) | null;
      if (ignore) return;
      setState(
        response?.ok && body
          ? { status: "paid", result: body }
          : { status: "failed", message: body?.message ?? "결제를 확인하지 못했어요. 잠시 후 다시 시도해 주세요." },
      );
    })();
    return () => {
      ignore = true;
    };
  }, [paymentId, failure]);

  if (state.status === "verifying") return <Skeleton shape="rect" width="100%" height={240} />;

  if (state.status === "failed") {
    return (
      <Empty
        visual="error"
        title="결제가 완료되지 않았어요"
        description={state.message}
        primaryAction={{ label: "홈으로", leftIcon: "home", onClick: () => router.push("/") }}
      />
    );
  }

  const { result } = state;
  return (
    <Empty
      visual="check"
      title="결제가 완료됐어요"
      description={`${result.orderName} · ${formatWon(result.amount)}`}
      secondaryAction={{ label: "홈으로", leftIcon: "home", onClick: () => router.push("/") }}
      primaryAction={{ label: "상품 다시 보기", onClick: () => router.push(`/products/${result.productId}`) }}
    />
  );
};
