import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** 소셜 로그인 OAuth 콜백. code를 세션으로 교환해 쿠키에 저장한 뒤 next 경로로 보낸다. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  // 외부 URL로의 오픈 리다이렉트를 막는다.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  // 구글 동의 화면에서 취소하면 code 없이 error=access_denied 로 돌아온다.
  if (searchParams.get("error") === "access_denied") {
    return NextResponse.redirect(new URL("/login?error=cancelled", origin));
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
