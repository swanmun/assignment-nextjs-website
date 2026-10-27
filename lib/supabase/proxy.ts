import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/**
 * 요청마다 Supabase 세션 토큰을 갱신하고, 갱신된 쿠키를 응답에 실어 보낸다.
 * 로그인 여부도 함께 돌려줘 proxy에서 낙관적 리다이렉트에 쓴다.
 */
export async function updateSession(request: NextRequest) {
  const { url, key } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // createServerClient와 getClaims 사이에 다른 코드를 두지 않는다. 세션 갱신이 어긋날 수 있다.
  const { data } = await supabase.auth.getClaims();

  return { response, isSignedIn: Boolean(data?.claims) };
}

/** 갱신된 세션 쿠키를 유지한 채 다른 경로로 보낸다. */
export function redirectWithSession(request: NextRequest, response: NextResponse, pathname: string) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
