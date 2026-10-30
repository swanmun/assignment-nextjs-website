/** 프로필 입력 규칙. 클라이언트 검증과 BFF 검증이 같은 값을 쓴다. */
export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 12;

export const PROFILE_IMAGE_TYPES = ["image/png", "image/jpeg"] as const;
export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
/** 보내기 전에 브라우저에서 줄이는 크기 (화면에는 80px로 보인다) */
export const PROFILE_IMAGE_UPLOAD_SIDE = 480;
export const PROFILE_IMAGE_UPLOAD_BYTES = 512 * 1024;

/** 문제가 있으면 안내 문구, 없으면 undefined */
export const validateNickname = (nickname: string) => {
  const length = nickname.trim().length;
  return length < NICKNAME_MIN || length > NICKNAME_MAX ? `${NICKNAME_MIN}~${NICKNAME_MAX}자로 입력해 주세요.` : undefined;
};
