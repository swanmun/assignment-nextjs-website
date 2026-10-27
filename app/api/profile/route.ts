import { NextResponse, type NextRequest } from "next/server";
import { validateNickname } from "@/lib/profile-rules";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** 닉네임 변경. body: { nickname } → { nickname } */
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요해요." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { nickname?: unknown } | null;
  const nickname = typeof body?.nickname === "string" ? body.nickname.trim() : "";
  const invalid = validateNickname(nickname);
  if (invalid) return NextResponse.json({ message: invalid }, { status: 400 });

  const { data, error } = await supabase
    .from("profile")
    .update({ nickname })
    .eq("user_id", user.id)
    .select("nickname")
    .single();
  if (error) return NextResponse.json({ message: "닉네임을 바꾸지 못했어요." }, { status: 500 });

  return NextResponse.json({ nickname: data.nickname });
}
