"use client";

import { useState, type MouseEvent } from "react";
import { Button, ButtonLink } from "@/components/button/Button";
import { Modal } from "@/components/modal/Modal";
import { Note } from "@/components/note/Note";
import { cx } from "@/lib/cx";
import styles from "./PaymentLink.module.css";

/** 결제창 팝업 크기. 모바일 브라우저는 크기를 무시하고 새 탭으로 연다. */
const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 760;

/** 화면 가운데에 결제창 팝업을 연다. 팝업이 막히면 null을 돌려준다. */
const openPaymentPopup = (href: string) => {
  const left = Math.max(0, window.screenX + (window.outerWidth - POPUP_WIDTH) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2);
  const popup = window.open(
    href,
    "payment-link",
    `popup=yes,width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${Math.round(left)},top=${Math.round(top)}`,
  );
  // noopener를 features에 넣으면 성공해도 null이 와서 막힘 여부를 알 수 없다. 열린 뒤에 끊는다.
  if (popup) popup.opener = null;
  return popup;
};

/** QR 모달 바디: QR 코드 + 안내 문구 */
export const PaymentQr = ({ qrSrc, productName }: Pick<PaymentLinkProps, "qrSrc" | "productName">) => (
  <div className={styles.qrBody}>
    {/* eslint-disable-next-line @next/next/no-img-element -- QR은 픽셀 그대로 키워 보여 준다 */}
    <img src={qrSrc} alt={`${productName} 결제 QR 코드`} className={styles.qr} />
    <Note center tone="secondary">
      휴대폰 카메라로 찍으면 결제 화면이 열려요.
    </Note>
  </div>
);

export type PaymentLinkProps = {
  /** 외부 결제 링크 (예: 페이앱 결제 링크) */
  href: string;
  /** 같은 결제 링크로 가는 QR 코드 이미지 */
  qrSrc: string;
  /** QR 모달 제목·대체 텍스트에 쓰는 상품 이름 */
  productName: string;
  className?: string;
};

/**
 * 외부 결제 링크 버튼 묶음.
 * 결제하기: 결제창을 팝업으로 연다(팝업이 막히면 새 탭 링크로 대신 이동).
 * QR로 결제하기: QR 코드를 모달로 띄워 휴대폰으로 찍어 결제하게 한다.
 */
export const PaymentLink = ({ href, qrSrc, productName, className }: PaymentLinkProps) => {
  const [qrOpen, setQrOpen] = useState(false);

  const onPay = (event: MouseEvent<HTMLAnchorElement>) => {
    // 팝업이 열렸으면 링크 이동을 막고, 막혔으면 target="_blank" 기본 동작으로 새 탭을 연다.
    if (openPaymentPopup(href)) event.preventDefault();
  };

  return (
    <div className={cx(styles.actions, className)}>
      <ButtonLink href={href} target="_blank" rel="noopener noreferrer" onClick={onPay} size="lg" rightIcon="chevron-right">
        결제하기
      </ButtonLink>
      <Button variant="secondary" size="lg" onClick={() => setQrOpen(true)}>
        QR로 결제하기
      </Button>
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="QR로 결제하기" width={300}>
        <PaymentQr qrSrc={qrSrc} productName={productName} />
      </Modal>
    </div>
  );
};
