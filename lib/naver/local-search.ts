import "server-only";

import type { PlaceSearchItem } from "@/lib/types";

/** 네이버 지역 검색은 한 번에 최대 5건까지 준다. */
export const LOCAL_SEARCH_DISPLAY = 5;

type LocalItem = {
  title: string;
  category: string;
  address: string;
  roadAddress: string;
  /** WGS84 경도 × 10^7 (예: "1269915199" → lng 126.9915199) */
  mapx: string;
  /** WGS84 위도 × 10^7 (예: "375671923" → lat 37.5671923) */
  mapy: string;
};

export class LocalSearchUnavailableError extends Error {}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'" };

/** 검색어 강조 태그(<b>)와 HTML 엔티티를 걷어낸다. */
const plain = (html: string) =>
  html.replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39|apos);/g, (_, entity: string) => ENTITIES[entity]);

const toItem = (item: LocalItem): PlaceSearchItem | null => {
  const longitude = Number(item.mapx) / 1e7;
  const latitude = Number(item.mapy) / 1e7;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude === 0 || longitude === 0) return null;
  const road = item.roadAddress.trim();
  const jibun = item.address.trim();
  return {
    title: plain(item.title),
    category: plain(item.category).split(">").pop()?.trim() ?? "",
    address: road || jibun,
    jibunAddress: road && jibun && jibun !== road ? jibun : null,
    latitude,
    longitude,
  };
};

/**
 * 네이버 지역 검색 (서버 전용 키). 좌표가 없는 결과는 뺀다.
 * 키가 없으면 LocalSearchUnavailableError를 던진다.
 */
export async function searchLocal(query: string): Promise<PlaceSearchItem[]> {
  const id = process.env.NAVER_SEARCH_CLIENT_ID;
  const secret = process.env.NAVER_SEARCH_CLIENT_SECRET;
  if (!id || !secret) {
    throw new LocalSearchUnavailableError("NAVER_SEARCH_CLIENT_ID, NAVER_SEARCH_CLIENT_SECRET 환경변수가 필요합니다.");
  }

  // NCP API Hub 지역 검색 (https://api.ncloud-docs.com/docs/naver-api-hub-search-local)
  const url = new URL("https://naverapihub.apigw.ntruss.com/search/v1/local");
  url.searchParams.set("query", query);
  url.searchParams.set("display", String(LOCAL_SEARCH_DISPLAY));
  const response = await fetch(url, {
    headers: { "X-NCP-APIGW-API-KEY-ID": id, "X-NCP-APIGW-API-KEY": secret },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`네이버 지역 검색 실패: ${response.status}`);

  const { items = [] } = (await response.json()) as { items?: LocalItem[] };
  return items.map(toItem).filter((item): item is PlaceSearchItem => item !== null);
}
