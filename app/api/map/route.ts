import { NextResponse, type NextRequest } from "next/server";
import { fetchStaticMap, STATIC_MAP_MAX_SIZE } from "@/lib/naver/static-map";

const size = (value: string | null) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n <= STATIC_MAP_MAX_SIZE ? n : null;
};

/**
 * 지도 이미지 (NCP Static Map 프록시). ?lat=&lng=&w=&h= → image/png
 * 지도 키는 서버에만 두고, 브라우저는 이 경로를 <img>로 부른다.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const latitude = Number(params.get("lat"));
  const longitude = Number(params.get("lng"));
  const width = size(params.get("w"));
  const height = size(params.get("h"));
  if (
    !params.get("lat") ||
    !params.get("lng") ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180 ||
    !width ||
    !height
  ) {
    return NextResponse.json({ message: "잘못된 지도 요청이에요." }, { status: 400 });
  }

  const map = await fetchStaticMap({ latitude, longitude, width, height });
  if (!map) return NextResponse.json({ message: "지도를 불러오지 못했어요." }, { status: 503 });

  return new Response(map.body, {
    headers: {
      "Content-Type": map.headers.get("Content-Type") ?? "image/png",
      // 같은 좌표·크기의 지도는 바뀌지 않는다.
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
