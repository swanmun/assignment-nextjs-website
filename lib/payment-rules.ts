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

/** 주문명 = DB 상품명(Product.name). 줄바꿈은 한 칸 띄어쓰기로 바꿔 한 줄로 보낸다. 검증할 때도 같은 함수로 비교한다. */
export const toOrderName = (name: string) => name.replace(/\s+/g, " ").trim();

/** 30000 → "30,000원" */
export const formatWon = (value: number) => `${value.toLocaleString("ko-KR")}원`;
