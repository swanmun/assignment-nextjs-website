import { NextResponse, type NextRequest } from "next/server";
import { PLACE_SEARCH_QUERY_MAX } from "@/lib/place-rules";
import { LocalSearchUnavailableError, searchLocal } from "@/lib/naver/local-search";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PlaceSearchResult } from "@/lib/types";

/** 맛집 등록용 장소 검색 (네이버 지역 검색, 최대 5건). ?q=검색어 → PlaceSearchResult */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!query) return NextResponse.json({ message: "검색어를 입력해 주세요." }, { status: 400 });
  if (query.length > PLACE_SEARCH_QUERY_MAX) {
    return NextResponse.json({ message: `검색어는 ${PLACE_SEARCH_QUERY_MAX}자 이하로 입력해 주세요.` }, { status: 400 });
  }

  // 검색 호출량을 아끼기 위해 글을 쓸 수 있는 로그인 사용자만 쓴다.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요해요." }, { status: 401 });

  try {
    const result: PlaceSearchResult = { query, items: await searchLocal(query) };
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LocalSearchUnavailableError) {
      return NextResponse.json({ message: "장소 검색을 아직 쓸 수 없어요. 장소명을 직접 입력해 주세요." }, { status: 503 });
    }
    return NextResponse.json({ message: "장소를 검색하지 못했어요." }, { status: 502 });
  }
}
