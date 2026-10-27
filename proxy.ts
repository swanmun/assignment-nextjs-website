import type { NextRequest } from "next/server";
import { redirectWithSession, updateSession } from "@/lib/supabase/proxy";

/** 로그인해야 들어갈 수 있는 경로 */
const PROTECTED = ["/me", "/restaurants/new"];
/** 맛집 수정 화면 (/restaurants/:id/edit) */
const EDIT_PATH = /^\/restaurants\/[^/]+\/edit\/?$/;

export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((path) => pathname === path || pathname.startsWith(`${path}/`)) || EDIT_PATH.test(pathname);
  if (!isSignedIn && isProtected) {
    return redirectWithSession(request, response, "/login");
  }
  if (isSignedIn && pathname === "/login") {
    return redirectWithSession(request, response, "/me");
  }
  return response;
}

export const config = {
  // 정적 파일·이미지는 건너뛴다.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)"],
};
