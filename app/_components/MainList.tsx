"use client";

import { useEffect, useRef, useState } from "react";
import { FolderOpen } from "lucide-react";
import { Empty } from "@/components/empty/Empty";
import { Icon } from "@/components/icon/Icon";
import { Spinner } from "@/components/spinner/Spinner";
import { ViewToggle, Window, WindowWell, type ListView } from "@/components/window/Window";
import type { Restaurant } from "@/lib/mock-data";
import page from "./page.module.css";
import { RestaurantGrid } from "./RestaurantGrid";

const PAGE_SIZE = 3;

type MainListProps = {
  restaurants: Restaurant[];
  query?: string;
};

/** 메인 "새로 올라온 맛집" 창 — 스크롤 끝에 닿으면 다음 묶음을 불러온다. */
export const MainList = ({ restaurants, query }: MainListProps) => {
  const [view, setView] = useState<ListView>("list");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visible < restaurants.length;
  const total = restaurants.length;

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasMore) return;
    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      // 목업 데이터라 네트워크 지연만 흉내 낸다.
      timer = setTimeout(() => setVisible((count) => count + PAGE_SIZE), 600);
    });
    observer.observe(target);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [hasMore, visible]);

  const shown = restaurants.slice(0, visible);

  return (
    <Window
      title={query ? `C:\\구로\\검색 — ${query}` : "C:\\구로\\새로 올라온 맛집"}
      icon={<FolderOpen size={14} />}
      minimizable
      toolbar={
        <>
          <span className="typo-label-md">총 {total}곳 · 최신순</span>
          <ViewToggle value={view} onChange={setView} />
        </>
      }
      status={[`${shown.length} / ${total} 표시`, "비로그인 열람 가능"]}
    >
      <WindowWell>
        {total === 0 ? (
          <Empty visual="search" title="검색 결과가 없어요" description="다른 이름이나 동네로 다시 찾아보세요." />
        ) : (
          <>
            <RestaurantGrid restaurants={shown} view={view} />
            {hasMore ? (
              <div ref={sentinelRef} className={`${page.listFooter} typo-label-md`} role="status">
                <Spinner size={20} label="" />
                다음 맛집을 불러오는 중...
              </div>
            ) : (
              <p className={`${page.listFooter} typo-label-md`}>
                <Icon name="check" size={16} />
                마지막 맛집이에요
              </p>
            )}
          </>
        )}
      </WindowWell>
    </Window>
  );
};
