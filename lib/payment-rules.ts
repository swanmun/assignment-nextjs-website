/**
 * 결제 규칙 상수. 클라이언트(결제 버튼·결제 완료 화면)와 BFF가 함께 쓴다.
 * 규칙 설명은 rules/payment.md 가 SSOT다. 값을 바꾸면 문서도 함께 바꾼다.
 */

/** 결제 통화. 상품 가격(Product.price)은 원 단위 정수다. */
export const PAYMENT_CURRENCY = "KRW" as const;

/** 결제 수단. 첫 버전은 카드만 받는다. */
export const PAYMENT_PAY_METHOD = "CARD" as const;

/** 결제를 마친 뒤 돌아올 결제 완료 페이지 경로 (PortOne redirectUrl) */
export const PAYMENT_COMPLETE_PATH = "/payments/complete";

/** payment.type 값. payment 테이블은 거래 기록(원장)이라 취소도 새 행으로 쌓는다. */
export const PAYMENT_TYPE = {
  /** 결제 완료 */
  paid: "PAID",
  /** 결제 취소(환불). 결제 취소 기능에서 쓴다. */
  cancelled: "CANCELLED",
} as const;

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

/** payment.amount 부호. 결제는 +, 취소는 −로 저장해 transaction_key별 합계가 남은 금액이 된다. */
export const PAYMENT_AMOUNT_SIGN: Record<PaymentType, 1 | -1> = { PAID: 1, CANCELLED: -1 };

/** 원장에 저장할 금액. 30000 → PAID 30000 / CANCELLED -30000 */
export const toLedgerAmount = (type: PaymentType, amount: number) => PAYMENT_AMOUNT_SIGN[type] * Math.abs(amount);

/** PortOne.requestPayment의 customData. PortOne에는 JSON 문자열로 저장된다. */
export type PaymentCustomData = {
  /** Product.id */
  productId: string;
  /** auth.users.id (결제한 회원) */
  userId: string;
};

/** 결제 완료 처리 결과 (POST /api/payments/complete) */
export type PaymentCompleteResult = {
  paymentId: string;
  productId: string;
  orderName: string;
  amount: number;
};

/** 결제 취소 결과 (POST /api/payments/[paymentId]/cancel) */
export type PaymentCancelResult = {
  paymentId: string;
  /** 환불 금액(원, 양수) */
  refundAmount: number;
};

/** 포트원에 남기는 취소 사유 (마이 페이지에서 본인이 취소) */
export const PAYMENT_CANCEL_REASON = "고객 요청";

/** 환불 규정: 행사 시작 N일(N×24시간) 전까지 전액 환불. 부분 환불은 하지 않는다. */
export const CANCEL_DEADLINE_DAYS = 3;

/**
 * 취소할 수 없는 이유. 취소할 수 있으면 null. 화면(버튼 잠금)과 BFF(최종 판단)가 함께 쓴다.
 * @param eventAt 결제 스냅숏의 행사 일시(ISO). 미정이면 null → 취소 가능
 */
export const getCancelBlockReason = (eventAt: string | null | undefined, now = Date.now()): string | null => {
  if (!eventAt) return null;
  const start = new Date(eventAt).getTime();
  if (Number.isNaN(start)) return null;
  if (start <= now) return "이미 끝난 행사예요";
  if (start - now < CANCEL_DEADLINE_DAYS * 24 * 60 * 60 * 1000) return `행사 ${CANCEL_DEADLINE_DAYS}일 전까지만 취소할 수 있어요`;
  return null;
};

/** 주문명 = DB 상품명(Product.name). 줄바꿈은 한 칸 띄어쓰기로 바꿔 한 줄로 보낸다. 검증할 때도 같은 함수로 비교한다. */
export const toOrderName = (name: string) => name.replace(/\s+/g, " ").trim();

/** 30000 → "30,000원" */
export const formatWon = (value: number) => `${value.toLocaleString("ko-KR")}원`;
