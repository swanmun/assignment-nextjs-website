import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 구글 소셜 로그인 시작. PKCE code verifier를 쿠키에 남기고 구글 동의 화면으로 보낸다.
 * 로그인 후에는 /api/auth/callback 이 세션을 만든다.
 */
export async function POST(request: NextRequest) {
  const { origin } = request.nextUrl;
  const callback = new URL("/api/auth/callback", origin);
  callback.searchParams.set("next", "/me");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login?error=auth", origin), { status: 303 });
  }
  return NextResponse.redirect(data.url, { status: 303 });
}
