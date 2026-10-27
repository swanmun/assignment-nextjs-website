"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/button/Button";
import { Empty } from "@/components/empty/Empty";
import { Icon } from "@/components/icon/Icon";
import { Spinner } from "@/components/spinner/Spinner";
import { ViewToggle, Window, WindowWell, type ListView } from "@/components/window/Window";
import { requestJson } from "@/lib/request-json";
import type { PlacePage } from "@/lib/types";
import page from "./page.module.css";
import { RestaurantGrid } from "./RestaurantGrid";

type MainListProps = {
  /** 서버에서 미리 읽은 첫 묶음 */
  initial: PlacePage;
  query?: string;
};

/** 메인 "새로 올라온 맛집" 창 — 스크롤 끝에 닿으면 BFF(GET /api/places)에서 다음 묶음을 불러온다. */
export const MainList = ({ initial, query }: MainListProps) => {
  const router = useRouter();
  const [view, setView] = useState<ListView>("list");
  const [places, setPlaces] = useState(initial.places);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [failed, setFailed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const total = initial.total ?? places.length;

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !cursor || failed) return;
    const controller = new AbortController();
    let loading = false;

    const loadMore = async () => {
      loading = true;
      const params = new URLSearchParams({ cursor });
      if (query) params.set("q", query);
      try {
        const next = await requestJson<PlacePage>(`/api/places?${params}`, { signal: controller.signal }, "");
        setPlaces((prev) => [...prev, ...next.places]);
        setCursor(next.nextCursor);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setFailed(true);
      } finally {
        loading = false;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading) loadMore();
    });
    observer.observe(target);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [cursor, failed, query]);

  const footer = () => {
    if (failed) {
      return (
        <div className={`${page.listFooter} typo-label-md`} role="alert">
          다음 맛집을 불러오지 못했어요.
          <Button variant="secondary" size="sm" onClick={() => setFailed(false)}>
            다시 시도
          </Button>
        </div>
      );
    }
    if (cursor) {
      return (
        <div ref={sentinelRef} className={`${page.listFooter} typo-label-md`} role="status">
          <Spinner size={20} label="" />
          다음 맛집을 불러오는 중...
        </div>
      );
    }
    return (
      <p className={`${page.listFooter} typo-label-md`}>
        <Icon name="check" size={16} />
        마지막 맛집이에요
      </p>
    );
  };

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
      status={[`${places.length} / ${total} 표시`, "비로그인 열람 가능"]}
    >
      <WindowWell>
        {places.length === 0 ? (
          query ? (
            <Empty visual="search" title="검색 결과가 없어요" description="다른 이름이나 동네로 다시 찾아보세요." />
          ) : (
            <Empty
              visual="edit"
              title="아직 등록된 맛집이 없어요"
              description="내가 찾은 숨은 맛집을 이웃에게 처음으로 소개해 보세요."
              primaryAction={{ label: "맛집 쓰기", leftIcon: "edit", onClick: () => router.push("/restaurants/new") }}
            />
          )
        ) : (
          <>
            <RestaurantGrid restaurants={places} view={view} />
            {footer()}
          </>
        )}
      </WindowWell>
    </Window>
  );
};
