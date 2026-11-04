import type { Metadata } from "next";
import { Badge } from "@/components/badge/Badge";
import { Fieldset } from "@/components/fieldset/Fieldset";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Note } from "@/components/note/Note";
import { PaymentLink } from "@/components/payment-link/PaymentLink";
import { PromoBanner } from "@/components/promo-banner/PromoBanner";
import { Panel } from "@/components/window/Window";
import { cx } from "@/lib/cx";
import page from "../../_components/page.module.css";
import styles from "./cooking.module.css";

/** 아이디어 검증용 상품 1건. 결제는 페이앱 결제 링크가 맡는다. */
const PRODUCT = {
  name: "취미 요리 수업 1건",
  price: 1000,
  imageSrc: "/images/promo-cooking-class.png",
  imageAlt: "심심한 주말 놓치지 아까운 기회 — 초밥과 도시락이 놓인 요리 수업 배너",
  description:
    "심심한 주말, 직접 만들어 먹는 한 끼는 어때요?\n초밥·도시락처럼 집에서도 따라 하기 쉬운 요리를 함께 만들어 보는 취미 요리 수업이에요.\n결제해 주시면 수업 일정과 장소를 따로 안내해 드려요.",
  paymentHref: "https://www.payapp.kr/L/z4nwAD",
  paymentQrSrc: "/images/payapp-qr-cooking-class.png",
} as const;

const formatWon = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export const metadata: Metadata = {
  title: `${PRODUCT.name} · 숨은 맛집 커뮤니티`,
  description: PRODUCT.description.split("\n")[0],
};

export default function CookingClass() {
  return (
    <div className={page.page}>
      <TopNavigation title="요리 수업" leftAction={{ icon: "arrow-left", label: "메인으로", href: "/" }} />
      <main className={cx(page.body, page.narrow)}>
        <PromoBanner imageSrc={PRODUCT.imageSrc} alt={PRODUCT.imageAlt} />
        <Panel>
          <header className={styles.header}>
            <Badge tone="info">1회 수업</Badge>
            <h2 className="typo-heading-lg">{PRODUCT.name}</h2>
            <p className={`${styles.price} typo-display-sm`}>{formatWon(PRODUCT.price)}</p>
          </header>
          <p className={`${styles.content} typo-body-md`}>{PRODUCT.description}</p>
          <Fieldset legend="주문 정보">
            <dl className={styles.summary}>
              <div className={styles.summaryRow}>
                <dt className="typo-label-md">상품</dt>
                <dd className="typo-body-md">{PRODUCT.name}</dd>
              </div>
              <div className={styles.summaryRow}>
                <dt className="typo-label-md">수량</dt>
                <dd className="typo-body-md">1건</dd>
              </div>
              <div className={cx(styles.summaryRow, styles.total)}>
                <dt className="typo-label-lg">결제 금액</dt>
                <dd className="typo-heading-sm">{formatWon(PRODUCT.price)}</dd>
              </div>
            </dl>
          </Fieldset>
          <div className={styles.pay}>
            <PaymentLink href={PRODUCT.paymentHref} qrSrc={PRODUCT.paymentQrSrc} productName={PRODUCT.name} />
            <Note>결제창은 팝업으로 열려요. 팝업이 막혀 있으면 새 탭으로 열려요.</Note>
            <Note>결제는 페이앱(PayApp)에서 진행돼요.</Note>
          </div>
        </Panel>
      </main>
    </div>
  );
}
