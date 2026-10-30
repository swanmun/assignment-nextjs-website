import { NextResponse, type NextRequest } from "next/server";
import { reverseGeocode, ReverseGeocodeUnavailableError } from "@/lib/naver/reverse-geocode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PlaceAddressResult } from "@/lib/types";

/** 장소 등록 지도 핀 위치의 주소 (네이버 리버스 지오코딩). ?lat=&lng= → PlaceAddressResult */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const latitude = Number(params.get("lat"));
  const longitude = Number(params.get("lng"));
  if (
    !params.get("lat") ||
    !params.get("lng") ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return NextResponse.json({ message: "잘못된 위치예요." }, { status: 400 });
  }

  // 호출량을 아끼기 위해 장소 검색처럼 로그인 사용자만 쓴다.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요해요." }, { status: 401 });

  try {
    const result: PlaceAddressResult = { found: await reverseGeocode({ latitude, longitude }) };
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ReverseGeocodeUnavailableError) {
      return NextResponse.json({ message: "주소 찾기를 아직 쓸 수 없어요." }, { status: 503 });
    }
    return NextResponse.json({ message: "주소를 찾지 못했어요." }, { status: 502 });
  }
}
