import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { listMyOrders } from "@/lib/supabase/payment-history";
import { listPlaces } from "@/lib/supabase/place";
import page from "../_components/page.module.css";
import { MyPage } from "./_components/MyPage";
import { toMyTab } from "./_components/tabs";

export const metadata: Metadata = { title: "마이 페이지 · 숨은 맛집 커뮤니티" };

type MeProps = {
  /** ?tab=payments · cancellations (결제 완료 페이지의 [결제 내역 보기]) */
  searchParams: Promise<{ tab?: string }>;
};

const MyPageContent = async ({ searchParams }: MeProps) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [{ places: posts }, orders, { tab }] = await Promise.all([listPlaces({ userId: user.id }), listMyOrders(), searchParams]);

  return <MyPage key={user.nickname} user={user} posts={posts} orders={orders} initialTab={toMyTab(tab)} />;
};

export default function Me({ searchParams }: MeProps) {
  return (
    <div className={page.page}>
      <TopNavigation title="마이 페이지" leftAction={{ icon: "arrow-left", label: "목록으로", href: "/" }} />
      <main className={page.body}>
        <Suspense fallback={<Skeleton shape="rect" width="100%" height={480} />}>
          <MyPageContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
