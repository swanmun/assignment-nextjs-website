import "server-only";

import { PortOneClient, PortOneError, type Payment } from "@portone/server-sdk";

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
