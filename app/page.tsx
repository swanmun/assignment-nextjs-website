import { Suspense } from "react";
import { ButtonLink } from "@/components/button/Button";
import { Hero } from "@/components/hero/Hero";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { listPlaces, PLACE_PAGE_SIZE } from "@/lib/supabase/place";
import { InstallPrompt } from "./_components/InstallPrompt";
import { MainList } from "./_components/MainList";
import page from "./_components/page.module.css";
import { SearchBar } from "./_components/SearchBar";

type SearchParams = Promise<{ q?: string | string[] }>;

const readQuery = async (searchParams: SearchParams) => {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
};

const SearchBarWithQuery = async ({ searchParams }: { searchParams: SearchParams }) => (
  <SearchBar defaultValue={await readQuery(searchParams)} />
);

const Results = async ({ searchParams }: { searchParams: SearchParams }) => {
  const query = await readQuery(searchParams);
  const first = await listPlaces({ query: query || undefined, limit: PLACE_PAGE_SIZE });
  return <MainList key={query} initial={first} query={query || undefined} />;
};

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className={page.page}>
      <TopNavigation title="숨은맛집.EXE" rightActions={[{ icon: "user", label: "마이 페이지", href: "/me" }]} />
      <Suspense fallback={<SearchBar />}>
        <SearchBarWithQuery searchParams={searchParams} />
      </Suspense>
      <Hero
        imageUrl="/images/hero-main.png"
        wideImageUrl="/images/hero-wide.png"
        badge="구로 출발 · 차로 1시간 이내"
        headline={"이번 주말엔\n이웃만 아는 그 집으로."}
      />
      <main className={page.body}>
        <Suspense fallback={<Skeleton shape="rect" width="100%" height={480} />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </main>
      <div className={page.bottomDock}>
        <ButtonLink href="/restaurants/new" size="lg" leftIcon="edit" className={page.fab}>
          맛집 쓰기
        </ButtonLink>
        <InstallPrompt />
      </div>
    </div>
  );
}
