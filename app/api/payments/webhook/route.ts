import { Webhook } from "@portone/server-sdk";
import { NextResponse, type NextRequest } from "next/server";
import { getPortoneEnv, getPortoneWebhookSecret } from "@/lib/portone";
import { PaymentCompleteError, recordPaidPayment } from "@/lib/supabase/payment";

/**
 * PortOne V2 웹훅 (rules/payment.md › 웹훅). 사용자 세션 없이 들어오므로 proxy matcher에서 제외했다.
 * 응답: 서명 실패 400 / 처리 완료·무시 200 / 일시 오류 500(포트원이 최대 5회 재전송).
 */
export async function POST(request: NextRequest) {
  // 서명 검증은 파싱하지 않은 원문 본문으로 한다.
  const body = await request.text();

  let webhook: Webhook.Webhook;
  try {
    webhook = await Webhook.verify(getPortoneWebhookSecret(), body, Object.fromEntries(request.headers));
  } catch (error) {
    if (error instanceof Webhook.WebhookVerificationError) {
      console.warn("[payment:webhook] 서명 검증 실패", error.reason);
      return new NextResponse(null, { status: 400 });
    }
    console.error("[payment:webhook] 웹훅 검증 오류", error);
    return new NextResponse(null, { status: 500 });
  }

  // 모르는 type, 결제 완료가 아닌 이벤트는 무시한다. (결제 취소 Transaction.Cancelled는 ⏳ 예정)
  if (Webhook.isUnrecognizedWebhook(webhook) || webhook.type !== "Transaction.Paid") {
    return new NextResponse(null, { status: 200 });
  }

  const { paymentId, storeId } = webhook.data;
  if (storeId !== getPortoneEnv().storeId) {
    console.warn("[payment:webhook] 다른 상점의 웹훅", { paymentId, storeId });
    return new NextResponse(null, { status: 200 });
  }

  try {
    await recordPaidPayment(paymentId);
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    // 4xx(결제 없음·미완료·금액 불일치 등)는 다시 받아도 결과가 같으므로 200으로 재전송을 멈춘다.
    if (error instanceof PaymentCompleteError && error.status < 500) {
      console.warn("[payment:webhook] 기록하지 않음", { paymentId, reason: error.message });
      return new NextResponse(null, { status: 200 });
    }
    console.error("[payment:webhook] 처리 실패, 재전송 대기", { paymentId, error });
    return new NextResponse(null, { status: 500 });
  }
}
