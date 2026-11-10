import type { Metadata } from "next";
import { Suspense } from "react";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { cx } from "@/lib/cx";
import page from "../../_components/page.module.css";
import { PaymentComplete } from "./_components/PaymentComplete";

export const metadata: Metadata = { title: "결제 완료 · 숨은 맛집 커뮤니티" };

/** PortOne이 redirectUrl 뒤에 붙여 주는 결제 결과 (rules/payment.md › 결제 완료 페이지) */
type PaymentCompleteProps = {
  searchParams: Promise<{ paymentId?: string; code?: string; message?: string }>;
};

const Result = async ({ searchParams }: PaymentCompleteProps) => {
  const { paymentId, code, message } = await searchParams;
  return <PaymentComplete paymentId={paymentId ?? null} failure={code ? (message ?? "결제를 마치지 못했어요.") : null} />;
};

export default function PaymentCompletePage({ searchParams }: PaymentCompleteProps) {
  return (
    <div className={page.page}>
      <TopNavigation title="결제 완료" />
      <main className={cx(page.body, page.narrow)}>
        <Suspense fallback={<Skeleton shape="rect" width="100%" height={240} />}>
          <Result searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
