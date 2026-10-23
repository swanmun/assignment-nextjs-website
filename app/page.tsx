import { Suspense } from "react";
import { ButtonLink } from "@/components/button/Button";
import { Hero } from "@/components/hero/Hero";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { cx } from "@/lib/cx";
import { RESTAURANTS } from "@/lib/mock-data";
import { MainList } from "./_components/MainList";
import page from "./_components/page.module.css";
import { SearchBar } from "./_components/SearchBar";

type SearchParams = Promise<{ q?: string | string[] }>;

const readQuery = async (searchParams: SearchParams) => {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
};

const matches = (keyword: string) => (value: string) => value.toLowerCase().includes(keyword.toLowerCase());

const SearchBarWithQuery = async ({ searchParams }: { searchParams: SearchParams }) => (
  <SearchBar defaultValue={await readQuery(searchParams)} />
);

const Results = async ({ searchParams }: { searchParams: SearchParams }) => {
  const query = await readQuery(searchParams);
  const restaurants = query
    ? RESTAURANTS.filter((r) => [r.name, r.address, r.summary, r.content].some(matches(query)))
    : RESTAURANTS;
  return <MainList key={query} restaurants={restaurants} query={query || undefined} />;
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
      <main className={cx(page.body, page.withFab)}>
        <Suspense fallback={<Skeleton shape="rect" width="100%" height={480} />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </main>
      <ButtonLink href="/restaurants/new" size="lg" leftIcon="edit" className={page.fab}>
        맛집 쓰기
      </ButtonLink>
    </div>
  );
}
