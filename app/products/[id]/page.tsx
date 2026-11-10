import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button/Button";
import { Empty } from "@/components/empty/Empty";
import { Fieldset } from "@/components/fieldset/Fieldset";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { PromoBanner } from "@/components/promo-banner/PromoBanner";
import { ResponsiveImage } from "@/components/responsive-image/ResponsiveImage";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { Panel } from "@/components/window/Window";
import { Note } from "@/components/note/Note";
import { cx } from "@/lib/cx";
import { formatWon, toOrderName } from "@/lib/payment-rules";
import { getPortoneCheckoutConfig } from "@/lib/portone";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getProduct } from "@/lib/supabase/product";
import page from "../../_components/page.module.css";
import { PayButton } from "./_components/PayButton";
import styles from "./product.module.css";

type ProductProps = {
  params: Promise<{ id: string }>;
};

const TITLE = "강연·모임 상세";
/** 이름의 줄바꿈은 배너·탭 제목에서는 한 칸 띄어쓰기로 */
const oneLine = toOrderName;

export async function generateMetadata({ params }: ProductProps): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return { title: product ? `${oneLine(product.name)} · 숨은 맛집 커뮤니티` : "숨은 맛집 커뮤니티" };
}

const Navigation = () => <TopNavigation title={TITLE} leftAction={{ icon: "arrow-left", label: "메인으로", href: "/" }} />;

const Detail = async ({ params }: ProductProps) => {
  const [product, user] = await Promise.all([getProduct((await params).id), getCurrentUser()]);
  const checkout = getPortoneCheckoutConfig();

  if (!product) {
    return (
      <main className={cx(page.body, page.narrow)}>
        <Empty visual="search" title="찾을 수 없는 상품이에요" description="판매가 끝났거나 주소가 바뀌었을 수 있어요." />
        <ButtonLink href="/" variant="secondary" className={page.fullWidth}>
          홈으로
        </ButtonLink>
      </main>
    );
  }

  const name = oneLine(product.name);
  const rows = [
    { label: "일시", value: product.eventAtLabel ?? "일정 미정" },
    { label: "장소", value: product.address ?? "장소 미정" },
    { label: "정원", value: product.capacity === null ? "제한 없음" : `${product.capacity}명` },
  ];

  return (
    <main className={cx(page.body, page.narrow)}>
      <PromoBanner imageSrc={product.mainImage.lg} mdImageSrc={product.mainImage.md} alt={name} />
      <Panel>
        <header className={styles.header}>
          <h2 className={`${styles.name} typo-heading-lg`}>{product.name}</h2>
          {product.price !== null && <p className={`${styles.price} typo-display-sm`}>{formatWon(product.price)}</p>}
        </header>
        <Fieldset legend="행사 정보">
          <dl className={styles.summary}>
            {rows.map((row) => (
              <div key={row.label} className={styles.summaryRow}>
                <dt className="typo-label-md">{row.label}</dt>
                <dd className="typo-body-md">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Fieldset>
        <Fieldset legend="상세 정보">
          {product.description && <p className={`${styles.content} typo-body-md`}>{product.description}</p>}
          <ResponsiveImage
            src={product.detailImage.lg}
            mdSrc={product.detailImage.md}
            alt={`${name} 상세 이미지`}
            className={styles.detailImage}
          />
        </Fieldset>
      </Panel>
      {product.price !== null && checkout ? (
        <PayButton
          storeId={checkout.storeId}
          channelKey={checkout.channelKey}
          productId={product.id}
          userId={user?.id ?? null}
          orderName={toOrderName(product.name)}
          totalAmount={product.price}
        />
      ) : (
        <Note center>지금은 결제할 수 없는 상품이에요</Note>
      )}
    </main>
  );
};

export default function ProductDetail({ params }: ProductProps) {
  return (
    <div className={page.page}>
      <Navigation />
      <Suspense
        fallback={
          <main className={cx(page.body, page.narrow)}>
            <Skeleton shape="rect" width="100%" height={480} />
          </main>
        }
      >
        <Detail params={params} />
      </Suspense>
    </div>
  );
}
