import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { listPlaces } from "@/lib/supabase/place";
import page from "../_components/page.module.css";
import { MyPage } from "./_components/MyPage";

export const metadata: Metadata = { title: "마이 페이지 · 숨은 맛집 커뮤니티" };

const MyPageContent = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { places: posts } = await listPlaces({ userId: user.id });

  return <MyPage key={user.nickname} user={user} posts={posts} />;
};

export default function Me() {
  return (
    <div className={page.page}>
      <TopNavigation title="마이 페이지" leftAction={{ icon: "arrow-left", label: "목록으로", href: "/" }} />
      <main className={page.body}>
        <Suspense fallback={<Skeleton shape="rect" width="100%" height={480} />}>
          <MyPageContent />
        </Suspense>
      </main>
    </div>
  );
}
