import { NextResponse, type NextRequest } from "next/server";
import {
  getPlace,
  getPlaceOwnership,
  readPlaceForm,
  removePlaceImages,
  sortImages,
  uploadPlaceImages,
} from "@/lib/supabase/place";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

/** 맛집 상세 → Place */
export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const place = await getPlace((await params).id);
    if (!place) return NextResponse.json({ message: "맛집을 찾을 수 없어요." }, { status: 404 });
    return NextResponse.json(place);
  } catch {
    return NextResponse.json({ message: "맛집을 불러오지 못했어요." }, { status: 500 });
  }
}

/**
 * 맛집 수정 (작성자 본인만). multipart name, content, keepImageIds[], images[] → { id }
 * keepImageIds에 없는 기존 사진은 지우고, 새 사진은 기존 사진 뒤에 붙인다.
 */
export async function PATCH(request: NextRequest, { params }: Context) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요해요." }, { status: 401 });

  const place = await getPlaceOwnership(supabase, id);
  if (!place) return NextResponse.json({ message: "맛집을 찾을 수 없어요." }, { status: 404 });
  if (place.user_id !== user.id) return NextResponse.json({ message: "내가 쓴 글만 수정할 수 있어요." }, { status: 403 });

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ message: "입력값을 읽지 못했어요." }, { status: 400 });
  const keepIds = new Set(formData.getAll("keepImageIds").filter((value) => typeof value === "string"));
  const images = sortImages(place.place_image);
  const kept = images.filter((image) => keepIds.has(image.id));
  const removed = images.filter((image) => !keepIds.has(image.id));

  const form = readPlaceForm(formData, kept.length);
  if ("message" in form) return NextResponse.json({ message: form.message }, { status: 400 });
  const { name, content, files } = form.input;

  const paths = await uploadPlaceImages(supabase, files);
  if (!paths) return NextResponse.json({ message: "사진을 올리지 못했어요." }, { status: 500 });

  // RLS에 막히면 에러 없이 0행이 바뀌므로 바뀐 행 수로 확인한다.
  const { count: updated, error: placeError } = await supabase
    .from("place")
    .update({ name, content }, { count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);
  if (placeError || !updated) {
    await removePlaceImages(supabase, paths);
    return NextResponse.json({ message: "맛집을 수정하지 못했어요." }, { status: 500 });
  }

  if (paths.length > 0) {
    const nextOrder = Math.max(-1, ...kept.map((image) => image.sort_order)) + 1;
    const { error: imageError } = await supabase
      .from("place_image")
      .insert(paths.map((image_path, i) => ({ place_id: id, image_path, sort_order: nextOrder + i })));
    if (imageError) {
      await removePlaceImages(supabase, paths);
      return NextResponse.json({ message: "사진을 저장하지 못했어요." }, { status: 500 });
    }
  }

  if (removed.length > 0) {
    const { error: deleteError } = await supabase
      .from("place_image")
      .delete()
      .in("id", removed.map((image) => image.id));
    // 행을 못 지웠으면 파일은 남겨 둔다(깨진 사진이 보이지 않도록).
    if (!deleteError) await removePlaceImages(supabase, removed.map((image) => image.image_path));
  }

  return NextResponse.json({ id });
}

/**
 * 맛집 소프트삭제 (작성자 본인만) → { id }
 * 행과 사진은 남겨 두고 deleted_at만 채운다. 조회(목록·상세·수정)에서는 deleted_at이 있는 글을 뺀다.
 */
export async function DELETE(_request: NextRequest, { params }: Context) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요해요." }, { status: 401 });

  const place = await getPlaceOwnership(supabase, id);
  if (!place) return NextResponse.json({ message: "맛집을 찾을 수 없어요." }, { status: 404 });
  if (place.user_id !== user.id) return NextResponse.json({ message: "내가 쓴 글만 삭제할 수 있어요." }, { status: 403 });

  // 삭제된 행은 조회 정책에 걸릴 수 있어 돌려받지 않고 바뀐 행 수만 센다.
  const { count: deleted, error } = await supabase
    .from("place")
    .update({ deleted_at: new Date().toISOString() }, { count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);
  if (error || !deleted) return NextResponse.json({ message: "글을 삭제하지 못했어요." }, { status: 500 });

  return NextResponse.json({ id });
}
