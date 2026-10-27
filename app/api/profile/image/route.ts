import { NextResponse, type NextRequest } from "next/server";
import { PROFILE_IMAGE_MAX_BYTES, PROFILE_IMAGE_TYPES } from "@/lib/profile-rules";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isStoredPath, PROFILE_IMAGE_BUCKET, profileImageUrl } from "@/lib/supabase/storage";

const EXTENSION: Record<(typeof PROFILE_IMAGE_TYPES)[number], string> = { "image/png": "png", "image/jpeg": "jpg" };

/**
 * 프로필 사진 변경. multipart "file" → { avatarUrl }
 * 스토리지에 <uuidv4>.<ext> 로 올리고, 테이블에는 파일 경로만 저장한 뒤 이전 파일을 지운다.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요해요." }, { status: 401 });

  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ message: "사진을 골라 주세요." }, { status: 400 });

  const type = PROFILE_IMAGE_TYPES.find((allowed) => allowed === file.type);
  if (!type) return NextResponse.json({ message: "PNG·JPG 사진만 올릴 수 있어요." }, { status: 400 });
  if (file.size > PROFILE_IMAGE_MAX_BYTES) return NextResponse.json({ message: "5MB 이하 사진만 올릴 수 있어요." }, { status: 400 });

  const { data: profile } = await supabase.from("profile").select("image_path").eq("user_id", user.id).single();
  const previousPath = profile?.image_path;

  const path = `${crypto.randomUUID()}.${EXTENSION[type]}`;
  const storage = supabase.storage.from(PROFILE_IMAGE_BUCKET);
  const { error: uploadError } = await storage.upload(path, file, { contentType: type });
  if (uploadError) return NextResponse.json({ message: "사진을 올리지 못했어요." }, { status: 500 });

  const { error: updateError } = await supabase.from("profile").update({ image_path: path }).eq("user_id", user.id);
  if (updateError) {
    await storage.remove([path]);
    return NextResponse.json({ message: "사진을 바꾸지 못했어요." }, { status: 500 });
  }

  // 이전 사진은 지운다. 실패해도 변경 자체는 성공이므로 무시한다.
  if (isStoredPath(previousPath)) await storage.remove([previousPath]);

  return NextResponse.json({ avatarUrl: profileImageUrl(path) });
}
