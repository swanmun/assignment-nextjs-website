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

/**
 * 서버 전용 secret key(service_role, RLS 우회). 사용자 세션 없이 쓰는 결제 기록·웹훅에서만 쓴다(rules/payment.md).
 * 절대 브라우저로 보내지 않는다.
 */
export function getSupabaseSecretEnv() {
  const { url } = getSupabaseEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY 환경변수가 필요합니다. .env.example을 참고하세요.");
  }
  return { url, secretKey };
}
