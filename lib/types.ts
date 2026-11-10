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

/** 화면 크기별 이미지 공개 URL. lg: 데스크톱(1024px 이상), md: 모바일·태블릿 */
export type SizedImage = { lg: string; md: string };

/** 강연·모임 상품 (메인 배너·상품 상세) */
export type Product = {
  id: string;
  name: string;
  description: string | null;
  /** 행사 일시 (ISO). 정해지지 않았으면 null */
  eventAt: string | null;
  /** 화면에 보일 행사 일시. 예: "2026.11.08(일) 오전 10:00" */
  eventAtLabel: string | null;
  address: string | null;
  /** 최대 참여 가능 수 */
  capacity: number | null;
  /** 가격(원) */
  price: number | null;
  /** 배너·상세 맨 위 대표 이미지 */
  mainImage: SizedImage;
  /** 상세 설명 이미지 */
  detailImage: SizedImage;
};

/** 마이 페이지 결제·취소 내역 한 줄. OrderItem props에 그대로 넘긴다(rules/payment.md › 결제 내역). */
export type OrderHistoryItem = {
  /** transaction_key(포트원 paymentId) */
  key: string;
  status: "paid" | "paid-locked" | "canceled";
  href: string;
  imageUrl: string;
  imageAlt: string;
  kind: string;
  title: string;
  /** "11.21(토) 11:00 · 구로역 2번 출구" */
  schedule: string;
  /** "25,000원" · 취소는 "환불 25,000원" */
  amount: string;
  /** "11.03 결제 · 신용카드" · 취소는 "결제 25,000원 · 11.05 취소" */
  amountDetail: string;
  /** paid-locked일 때 취소할 수 없는 이유 */
  lockedReason?: string;
};

export type OrderHistory = {
  /** 취소되지 않은 결제, 최신 결제순 */
  paid: OrderHistoryItem[];
  /** 취소한 결제, 최신 취소순 */
  cancelled: OrderHistoryItem[];
};
