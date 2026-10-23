import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { CURRENT_USER, restaurantsBy } from "@/lib/mock-data";
import page from "../_components/page.module.css";
import { MyPage } from "./_components/MyPage";

export const metadata: Metadata = { title: "마이 페이지 · 숨은 맛집 커뮤니티" };

type MeProps = {
  searchParams: Promise<{ empty?: string }>;
};

const MyPageContent = async ({ searchParams }: MeProps) => {
  const { empty } = await searchParams;
  // ?empty=1 : design.pen "05 마이 - 쓴 글 없음" 시안 상태
  const posts = empty ? [] : restaurantsBy(CURRENT_USER.nickname).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const user = empty ? { ...CURRENT_USER, nickname: "항동새내기", email: "hangdong.new@gmail.com" } : CURRENT_USER;

  return <MyPage key={user.nickname} user={user} posts={posts} />;
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
