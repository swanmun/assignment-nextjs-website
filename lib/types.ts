/** 서버(BFF)가 화면에 넘겨주는 데이터 모양. 서버·클라이언트가 함께 쓴다. */
import type { PlaceLocation } from "./place-rules";

export type { PlaceLocation };

export type User = {
  id: string;
  nickname: string;
  email: string;
  avatarUrl: string;
  joinedAt: string;
};

export type PlacePhoto = {
  /** place_image.id */
  id: string;
  url: string;
};

export type Place = {
  id: string;
  name: string;
  /** 상세 본문 */
  content: string;
  /** 카드 요약 (본문 앞부분) */
  summary: string;
  address: string;
  /** 장소 검색으로 고른 위치. 이름만 직접 입력했으면 null */
  location: PlaceLocation | null;
  authorId: string;
  author: string;
  authorAvatarUrl: string;
  /** 카드 표기 "MM.DD" */
  date: string;
  /** 상세 표기 "YYYY.MM.DD" */
  createdAt: string;
  /** 등록 순서대로. 첫 장이 대표 사진이다. */
  photos: PlacePhoto[];
};

/** 장소 검색 결과 1건 (GET /api/places/search) */
export type PlaceSearchItem = PlaceLocation & {
  /** 가게 이름 */
  title: string;
  /** 분류 마지막 단계 (예: "칼국수,만두") */
  category: string;
};

export type PlaceSearchResult = {
  query: string;
  items: PlaceSearchItem[];
};

/** 좌표로 찾은 주소 */
export type PlaceAddress = Pick<PlaceLocation, "address" | "jibunAddress">;

/** 지도 핀 위치의 주소 (GET /api/places/address). 그 위치에 상세 주소가 없으면 found가 null */
export type PlaceAddressResult = {
  found: PlaceAddress | null;
};

export type PlacePage = {
  places: Place[];
  /** 다음 묶음을 불러올 커서. 마지막 묶음이면 null */
  nextCursor: string | null;
  /** 조건에 맞는 전체 개수. 첫 묶음에만 담긴다. */
  total?: number;
};
