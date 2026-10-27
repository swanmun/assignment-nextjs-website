import { NextResponse, type NextRequest } from "next/server";
import { listPlaces, PLACE_PAGE_SIZE, readPlaceForm, removePlaceImages, uploadPlaceImages } from "@/lib/supabase/place";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** 맛집 목록 (무한 스크롤). ?q=검색어&cursor=이전 묶음의 nextCursor → PlacePage */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim() || undefined;
  const cursor = params.get("cursor") || undefined;
  if (cursor && Number.isNaN(Date.parse(cursor))) {
    return NextResponse.json({ message: "잘못된 커서예요." }, { status: 400 });
  }

  try {
    return NextResponse.json(await listPlaces({ query, cursor, limit: PLACE_PAGE_SIZE }));
  } catch {
    return NextResponse.json({ message: "맛집 목록을 불러오지 못했어요." }, { status: 500 });
  }
}

/**
 * 맛집 등록. multipart name, content, images[] → 201 { id }
 * 주소는 아직 받지 않는다. DB 기본값("등록 대기중")으로 저장된다.
 * 사진은 place-image 버킷에 <uuidv4>.<ext>로 올리고 place_image 테이블에 경로만 저장한다.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요해요." }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ message: "입력값을 읽지 못했어요." }, { status: 400 });
  const form = readPlaceForm(formData);
  if ("message" in form) return NextResponse.json({ message: form.message }, { status: 400 });
  const { name, content, files } = form.input;

  const paths = await uploadPlaceImages(supabase, files);
  if (!paths) return NextResponse.json({ message: "사진을 올리지 못했어요." }, { status: 500 });

  const { data: place, error: placeError } = await supabase
    .from("place")
    .insert({ name, content, user_id: user.id })
    .select("id")
    .single();
  if (placeError) {
    await removePlaceImages(supabase, paths);
    return NextResponse.json({ message: "맛집을 등록하지 못했어요." }, { status: 500 });
  }

  const { error: imageError } = await supabase
    .from("place_image")
    .insert(paths.map((image_path, sort_order) => ({ place_id: place.id, image_path, sort_order })));
  if (imageError) {
    await supabase.from("place").delete().eq("id", place.id);
    await removePlaceImages(supabase, paths);
    return NextResponse.json({ message: "맛집을 등록하지 못했어요." }, { status: 500 });
  }

  return NextResponse.json({ id: place.id }, { status: 201 });
}
