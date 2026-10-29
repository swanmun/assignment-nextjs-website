/** 맛집 글 입력 규칙. 클라이언트 검증과 BFF 검증이 같은 값을 쓴다. */
export const PLACE_NAME_MAX = 50;
export const PLACE_CONTENT_MIN = 10;
export const PLACE_CONTENT_MAX = 2000;

export const PLACE_IMAGE_MIN = 1;
export const PLACE_IMAGE_MAX = 5;
export const PLACE_IMAGE_TYPES = ["image/png", "image/jpeg"] as const;
export const PLACE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

/** 장소를 고르지 않고 이름만 입력했을 때 주소. DB 기본값과 같은 문구. */
export const PLACE_ADDRESS_PENDING = "등록 대기중";
export const PLACE_ADDRESS_MAX = 200;
export const PLACE_SEARCH_QUERY_MAX = 50;

/** 장소 검색으로 고른 위치. 좌표는 WGS84 */
export type PlaceLocation = {
  /** 도로명 주소 (없으면 지번 주소) */
  address: string;
  /** 지번 주소 (도로명 주소와 같으면 null) */
  jibunAddress: string | null;
  latitude: number;
  longitude: number;
};

/** 문제가 있으면 안내 문구, 없으면 undefined */
export const validatePlaceLocation = ({ address, jibunAddress, latitude, longitude }: PlaceLocation) => {
  if (!address.trim() || address.length > PLACE_ADDRESS_MAX || (jibunAddress?.length ?? 0) > PLACE_ADDRESS_MAX) {
    return "주소를 다시 검색해 주세요.";
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return "위치를 다시 지정해 주세요.";
  }
};

/** "서울특별시 구로구 오류동 45-12" → "오류동 45-12" (시·구는 도로명 주소와 겹치므로 뺀다) */
export const shortJibun = (jibunAddress: string) => jibunAddress.split(" ").slice(2).join(" ") || jibunAddress;

/** 문제가 있으면 안내 문구, 없으면 undefined */
export const validatePlaceName = (name: string) => {
  const length = name.trim().length;
  if (length === 0) return "맛집 이름을 입력해 주세요.";
  if (length > PLACE_NAME_MAX) return `${PLACE_NAME_MAX}자 이하로 입력해 주세요.`;
};

export const validatePlaceContent = (content: string) => {
  const length = content.trim().length;
  if (length === 0) return "추천 내용을 입력해 주세요.";
  if (length < PLACE_CONTENT_MIN) return `${PLACE_CONTENT_MIN}자 이상 입력해 주세요.`;
  if (length > PLACE_CONTENT_MAX) return `${PLACE_CONTENT_MAX}자 이하로 입력해 주세요.`;
};

/** 사진 1장 검증 */
export const validatePlaceImage = (file: { type: string; size: number }) => {
  if (!(PLACE_IMAGE_TYPES as readonly string[]).includes(file.type)) return "JPG·PNG 사진만 올릴 수 있어요";
  if (file.size > PLACE_IMAGE_MAX_BYTES) return "1장당 10MB까지 올릴 수 있어요";
};

/** 사진 장수 검증 */
export const validatePlaceImageCount = (count: number) => {
  if (count < PLACE_IMAGE_MIN) return `사진을 ${PLACE_IMAGE_MIN}장 이상 올려 주세요`;
  if (count > PLACE_IMAGE_MAX) return `사진은 최대 ${PLACE_IMAGE_MAX}장까지 올릴 수 있어요`;
};
