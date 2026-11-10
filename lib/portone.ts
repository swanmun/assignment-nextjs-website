import "server-only";

import { Payment, PortOneClient, PortOneError } from "@portone/server-sdk";

/** PortOne V2 접속 정보. 모두 서버 전용 환경변수다(rules/payment.md). */
export function getPortoneEnv() {
  const storeId = process.env.PORTONE_STORE_ID;
  const channelKey = process.env.PORTONE_CHANNEL_KEY;
  const apiSecret = process.env.PORTONE_API_SECRET;
  if (!storeId || !channelKey || !apiSecret) {
    throw new Error("PORTONE_STORE_ID, PORTONE_CHANNEL_KEY, PORTONE_API_SECRET 환경변수가 필요합니다. .env.example을 참고하세요.");
  }
  return { storeId, channelKey, apiSecret };
}

/**
 * 결제창 호출에 필요한 공개 값만. 결제 버튼(클라이언트)에 props로 넘긴다. API Secret은 넣지 않는다.
 * 설정하지 않았으면 null → 상세 페이지는 결제 버튼 대신 안내를 보여 준다.
 */
export function getPortoneCheckoutConfig() {
  const storeId = process.env.PORTONE_STORE_ID;
  const channelKey = process.env.PORTONE_CHANNEL_KEY;
  return storeId && channelKey ? { storeId, channelKey } : null;
}

let client: PortOneClient | null = null;
const portone = () => (client ??= PortOneClient({ secret: getPortoneEnv().apiSecret }));

/** PortOne에서 결제 건을 조회한다. 없는 결제거나 조회 권한이 없으면 null */
export async function fetchPortonePayment(paymentId: string): Promise<Payment.Payment | null> {
  try {
    return await portone().payment.getPayment({ paymentId, storeId: getPortoneEnv().storeId });
  } catch (error) {
    if (error instanceof PortOneError) return null;
    throw error;
  }
}

/** 웹훅 서명 시크릿(포트원 콘솔 > 결제알림(Webhook) 관리). 없으면 웹훅을 처리하지 않는다. */
export function getPortoneWebhookSecret() {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!secret) throw new Error("PORTONE_WEBHOOK_SECRET 환경변수가 필요합니다. .env.example을 참고하세요.");
  return secret;
}

/** 포트원 결제 취소 결과 */
export type PortoneCancelOutcome =
  | { kind: "succeeded" }
  | { kind: "requested" }
  | { kind: "already-cancelled" }
  | { kind: "failed"; status: number; message: string };

/**
 * 결제를 전액 취소한다(rules/payment.md › 결제 취소). amount를 넣지 않으면 전액 취소다.
 * currentCancellableAmount가 포트원 잔액과 다르면 취소하지 않는다(이중 환불 방지).
 */
export async function cancelPortonePayment(paymentId: string, currentCancellableAmount: number, reason: string): Promise<PortoneCancelOutcome> {
  try {
    const { cancellation } = await portone().payment.cancelPayment({
      paymentId,
      storeId: getPortoneEnv().storeId,
      reason,
      requester: "CUSTOMER",
      currentCancellableAmount,
    });
    if (cancellation.status === "SUCCEEDED") return { kind: "succeeded" };
    if (cancellation.status === "REQUESTED") return { kind: "requested" };
    console.error("[payment] 포트원 취소 실패", { paymentId, cancellation });
    return { kind: "failed", status: 502, message: "카드사에서 취소를 처리하지 못했어요. 잠시 후 다시 시도해 주세요." };
  } catch (error) {
    if (!(error instanceof Payment.CancelPaymentError)) throw error;
    const { data } = error;
    switch (data.type) {
      case "PAYMENT_ALREADY_CANCELLED":
        return { kind: "already-cancelled" };
      case "CANCELLABLE_AMOUNT_CONSISTENCY_BROKEN":
        console.error("[payment] 취소 가능 잔액 불일치", { paymentId, currentCancellableAmount });
        return { kind: "failed", status: 409, message: "취소할 수 있는 금액이 맞지 않아요. 고객센터로 문의해 주세요." };
      case "PAYMENT_NOT_PAID":
        return { kind: "failed", status: 409, message: "취소할 수 없는 결제예요." };
      case "PG_PROVIDER":
        console.error("[payment] PG사 취소 오류", { paymentId, pgCode: data.pgCode, pgMessage: data.pgMessage });
        return { kind: "failed", status: 502, message: "카드사에서 취소를 처리하지 못했어요. 잠시 후 다시 시도해 주세요." };
      default:
        console.error("[payment] 포트원 취소 오류", { paymentId, data });
        return { kind: "failed", status: 500, message: "결제를 취소하지 못했어요. 잠시 후 다시 시도해 주세요." };
    }
  }
}
