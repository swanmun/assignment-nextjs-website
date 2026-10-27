import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getSupabaseEnv } from "./env";

/**
 * Route Handler·Server Action·Server Component에서 쓰는 Supabase 클라이언트.
 * 세션은 쿠키로 주고받는다. Server Component에서는 쿠키를 쓸 수 없으므로 갱신은 proxy가 맡는다.
 */
export async function createSupabaseServerClient() {
  // 사용자 세션으로 읽으므로 사전 렌더링에서 제외한다. (supabase-js가 내부에서 Date.now()를 쓴다)
  await connection();
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component에서 호출된 경우. proxy가 세션을 갱신하므로 무시한다.
        }
      },
    },
  });
}
