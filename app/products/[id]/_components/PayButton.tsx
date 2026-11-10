"use client";

import { useState } from "react";
import PortOne from "@portone/browser-sdk/v2";
import { v4 as uuidv4 } from "uuid";
import { Button, ButtonLink } from "@/components/button/Button";
import { Toast } from "@/components/toast/Toast";
import {
  formatWon,
  PAYMENT_COMPLETE_PATH,
  PAYMENT_CURRENCY,
  PAYMENT_PAY_METHOD,
  type PaymentCustomData,
} from "@/lib/payment-rules";
import page from "../../../_components/page.module.css";

export type PayButtonProps = {
  /** PORTONE_STORE_ID (서버가 넘긴다) */
  storeId: string;
  /** PORTONE_CHANNEL_KEY (서버가 넘긴다) */
  channelKey: string;
  productId: string;
  /** 로그인한 회원 id. 로그인하지 않았으면 null → 로그인 페이지로 보낸다. */
  userId: string | null;
  /** DB 상품명(한 줄) */
  orderName: string;
  /** DB 상품 가격(원) */
  totalAmount: number;
};

/**
 * 배너 상세의 [결제하기]. PortOne 결제창을 열고, 결제를 마치면 결제 완료 페이지로 리다이렉트한다.
 * 결제 성공 여부는 여기서 판단하지 않는다. 결제 완료 페이지가 BFF로 검증한다(rules/payment.md).
 */
export const PayButton = ({ storeId, channelKey, productId, userId, orderName, totalAmount }: PayButtonProps) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = `${formatWon(totalAmount)} 결제하기`;

  if (!userId) {
    return (
      <ButtonLink href={`/login?next=/products/${productId}`} size="lg" className={page.fullWidth}>
        로그인하고 {label}
      </ButtonLink>
    );
  }

  const pay = async () => {
    setPending(true);
    setError(null);
    const customData: PaymentCustomData = { productId, userId };
    try {
      const response = await PortOne.requestPayment({
        storeId,
        paymentId: uuidv4(),
        orderName,
        totalAmount,
        currency: PAYMENT_CURRENCY,
        channelKey,
        payMethod: PAYMENT_PAY_METHOD,
        redirectUrl: new URL(PAYMENT_COMPLETE_PATH, window.location.origin).toString(),
        // PC 결제창(iframe·팝업)도 모바일처럼 결제 완료 페이지로 보내 처리 경로를 하나로 둔다.
        forceRedirect: true,
        customData,
      });
      // forceRedirect라도 결제창을 열기 전에 난 오류는 여기로 돌아온다.
      if (response?.code !== undefined) {
        setError(response.message ?? "결제창을 열지 못했어요.");
        setPending(false);
      }
    } catch {
      setError("결제창을 열지 못했어요. 잠시 후 다시 시도해 주세요.");
      setPending(false);
    }
  };

  return (
    <>
      {error && (
        <div className={page.toastLayer}>
          <Toast type="error" onClose={() => setError(null)}>
            {error}
          </Toast>
        </div>
      )}
      <Button size="lg" loading={pending} disabled={pending} onClick={pay} className={page.fullWidth}>
        {label}
      </Button>
    </>
  );
};
