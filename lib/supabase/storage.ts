import "server-only";

export const PROFILE_IMAGE_BUCKET = "profile-image";
export const PLACE_IMAGE_BUCKET = "place-image";

/** 버킷 안 파일 경로 → 공개 URL. 스토리지 주소는 환경변수로 받는다. */
const publicUrl = (bucket: string, path: string) => {
  const base = process.env.SUPABASE_STORAGE_URL;
  if (!base) throw new Error("SUPABASE_STORAGE_URL 환경변수가 필요합니다. .env.example을 참고하세요.");
  return `${base}/${bucket}/${path}`;
};

/**
 * 테이블에 저장한 파일 경로를 공개 URL로 바꾼다.
 * 구글 프로필 사진처럼 이미 전체 URL이면 그대로 쓴다.
 */
export function profileImageUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return publicUrl(PROFILE_IMAGE_BUCKET, path);
}

export const placeImageUrl = (path: string) => publicUrl(PLACE_IMAGE_BUCKET, path);

/** 우리 버킷에 올린 파일 경로인지 (구글 사진 URL이면 false) */
export const isStoredPath = (path: string | null | undefined): path is string => !!path && !/^https?:\/\//.test(path);

const EXTENSION: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg" };

/** 스토리지에 올릴 파일 이름: <uuidv4>.<ext> */
export const storagePath = (contentType: string) => `${crypto.randomUUID()}.${EXTENSION[contentType] ?? "bin"}`;
