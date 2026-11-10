import { NextResponse, type NextRequest } from "next/server";
import type { PaymentCancelResult } from "@/lib/payment-rules";
import { cancelMyPayment, PaymentCancelPendingError, PaymentCompleteError } from "@/lib/supabase/payment";

/**
 * 결제 전액 취소 (rules/payment.md › 결제 취소). 마이 페이지 결제 내역의 [결제 취소]가 부른다.
 * 200 PaymentCancelResult · 202 { pending, message } 취소 접수(비동기) · 4xx/5xx { message }
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;

  try {
    const result: PaymentCancelResult = await cancelMyPayment(paymentId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PaymentCancelPendingError) {
      return NextResponse.json({ pending: true, message: error.message }, { status: 202 });
    }
    if (error instanceof PaymentCompleteError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("[payment] 결제 취소 처리 실패", error);
    return NextResponse.json({ message: "결제를 취소하지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
