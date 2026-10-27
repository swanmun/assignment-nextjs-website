/** 맛집 글 입력 규칙. 클라이언트 검증과 BFF 검증이 같은 값을 쓴다. */
export const PLACE_NAME_MAX = 50;
export const PLACE_CONTENT_MIN = 10;
export const PLACE_CONTENT_MAX = 2000;

export const PLACE_IMAGE_MIN = 1;
export const PLACE_IMAGE_MAX = 5;
export const PLACE_IMAGE_TYPES = ["image/png", "image/jpeg"] as const;
export const PLACE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

/** 주소 입력은 아직 없다. DB 기본값과 같은 문구. */
export const PLACE_ADDRESS_PENDING = "등록 대기중";

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
