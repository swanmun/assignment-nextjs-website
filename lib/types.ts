/** 서버(BFF)가 화면에 넘겨주는 데이터 모양. 서버·클라이언트가 함께 쓴다. */

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

export type PlacePage = {
  places: Place[];
  /** 다음 묶음을 불러올 커서. 마지막 묶음이면 null */
  nextCursor: string | null;
  /** 조건에 맞는 전체 개수. 첫 묶음에만 담긴다. */
  total?: number;
};
