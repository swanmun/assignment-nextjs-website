import { NextResponse, type NextRequest } from "next/server";
import type { PaymentCompleteResult } from "@/lib/payment-rules";
import { completePayment, PaymentCompleteError } from "@/lib/supabase/payment";

/**
 * 결제 완료 처리. body: { paymentId } → PaymentCompleteResult
 * 결제 완료 페이지가 PortOne 결제창에서 돌아오면 부른다. 검증·기록 규칙은 rules/payment.md.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { paymentId?: unknown } | null;
  const paymentId = typeof body?.paymentId === "string" ? body.paymentId : "";
  if (!paymentId) return NextResponse.json({ message: "결제 번호가 필요해요." }, { status: 400 });

  try {
    const result: PaymentCompleteResult = await completePayment(paymentId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PaymentCompleteError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("[payment] 결제 완료 처리 실패", error);
    return NextResponse.json({ message: "결제를 확인하지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
