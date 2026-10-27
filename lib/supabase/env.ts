import "server-only";

/** 서버 전용 Supabase 접속 정보. 클라이언트 번들에 들어가면 빌드가 실패한다. */
export function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY 환경변수가 필요합니다. .env.example을 참고하세요.");
  }
  return { url, key };
}
