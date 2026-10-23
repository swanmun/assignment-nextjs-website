/** 백엔드 연동 전까지 쓰는 목업 데이터 (design.pen 시안 문구 기준) */

export type Restaurant = {
  id: string;
  name: string;
  address: string;
  /** 지번 등 보조 주소 */
  addressDetail?: string;
  /** 카드 요약 */
  summary: string;
  /** 상세 본문 */
  content: string;
  author: string;
  /** 카드 표기 "MM.DD" */
  date: string;
  /** 상세 표기 "YYYY.MM.DD" */
  createdAt: string;
  photos: string[];
  /** 태블릿 이상에서 쓸 가로로 긴 사진 (photos와 같은 순서) */
  widePhotos?: (string | undefined)[];
  /** 지도 핀 이름표 */
  mapLabel: string;
  roadLabel: string;
  isNew?: boolean;
};

export type User = {
  nickname: string;
  email: string;
  avatarUrl: string;
  joinedAt: string;
};

export const CURRENT_USER: User = {
  nickname: "개봉동먹보",
  email: "gaebong.mukbo@gmail.com",
  avatarUrl: "/images/avatar.png",
  joinedAt: "2026.09.02",
};

export const RESTAURANTS: Restaurant[] = [
  {
    id: "oryu-kalguksu",
    name: "오류동 골목 손칼국수",
    address: "서울 구로구 오류로 8길 23",
    addressDetail: "(오류동 45-12)",
    summary: "사골 육수에 손으로 뽑은 면. 가게 뒤 공터에 주차 6대 가능하고, 아이용 작은 그릇도 따로 줘요.",
    content:
      "오류동 시장 골목 끝에 있는 30년 된 칼국수집이에요. 사골 육수를 아침마다 새로 끓이고, 면은 주문 들어가면 바로 썰어요.\n\n겉절이가 정말 맛있어서 리필을 두 번은 하게 돼요. 아이 데려가면 작은 그릇이랑 가위를 먼저 챙겨 주세요.\n\n🅿 가게 뒤 공터에 6대 주차 가능. 주말 12시~1시는 피하는 게 좋아요.",
    author: "개봉동먹보",
    date: "10.15",
    createdAt: "2026.10.15",
    photos: ["/images/restaurant-4.png", "/images/restaurant-1.png", "/images/restaurant-3.png", "/images/restaurant-8.png"],
    widePhotos: ["/images/restaurant-4-wide.png"],
    mapLabel: "손칼국수",
    roadLabel: "오류로",
    isNew: true,
  },
  {
    id: "hangdong-boribap",
    name: "항동 저수지 앞 보리밥",
    address: "경기 부천시 범안로 112",
    summary: "창가 자리에서 저수지가 보여요. 주말 점심엔 11시 반 전에 가야 대기 없어요.",
    content:
      "항동 저수지를 바라보는 창가 자리가 명당이에요. 보리밥에 나물 일곱 가지가 나오고, 된장찌개는 무한 리필이에요.\n\n주말 점심엔 11시 반 전에 가야 대기 없어요.",
    author: "항동커플",
    date: "10.14",
    createdAt: "2026.10.14",
    photos: ["/images/restaurant-2.png"],
    mapLabel: "보리밥",
    roadLabel: "범안로",
  },
  {
    id: "siheung-bajirak",
    name: "시흥 갯골 바지락집",
    address: "경기 시흥시 동서로 287",
    summary: "바지락 칼국수 2인분이 셋이 먹어도 충분. 넓은 전용 주차장.",
    content: "바지락을 아끼지 않고 넣어 줘요. 칼국수 2인분이 셋이 먹어도 충분하고, 전용 주차장이 넓어서 주말에도 편해요.",
    author: "주말드라이버",
    date: "10.12",
    createdAt: "2026.10.12",
    photos: ["/images/restaurant-3.png"],
    mapLabel: "바지락집",
    roadLabel: "동서로",
  },
  {
    id: "guro-sundaeguk",
    name: "구로시장 할매 순대국",
    address: "서울 구로구 구로중앙로 22길 10",
    summary: "새벽 6시부터 여는 순대국집. 공영주차장 30분 무료, 아이 메뉴로 순대 반 접시도 돼요.",
    content: "새벽 6시부터 여는 순대국집이에요. 공영주차장 30분 무료이고, 아이 메뉴로 순대 반 접시도 주문할 수 있어요.",
    author: "개봉동먹보",
    date: "10.18",
    createdAt: "2026.10.18",
    photos: ["/images/restaurant-8.png"],
    mapLabel: "순대국",
    roadLabel: "구로중앙로",
  },
  {
    id: "gocheok-budae",
    name: "고척동 옛날식당",
    address: "서울 구로구 고척로 45길 7",
    summary: "간판 없던 시절부터 있던 부대찌개집. 저녁엔 동네 사람들로 꽉 차요. 근처 고척돔 주차장 이용.",
    content: "간판 없던 시절부터 있던 부대찌개집이에요. 저녁엔 동네 사람들로 꽉 차니 조금 일찍 가세요. 주차는 근처 고척돔 주차장을 이용하면 돼요.",
    author: "개봉동먹보",
    date: "10.09",
    createdAt: "2026.10.09",
    photos: ["/images/restaurant-7.png"],
    mapLabel: "옛날식당",
    roadLabel: "고척로",
  },
];

/** 메인 목록 총 개수 (서버 페이지네이션 표기용) */
export const TOTAL_RESTAURANTS = 128;

export const findRestaurant = (id: string) => RESTAURANTS.find((restaurant) => restaurant.id === id);

export const restaurantsBy = (nickname: string) => RESTAURANTS.filter((restaurant) => restaurant.author === nickname);
