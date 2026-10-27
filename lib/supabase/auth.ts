import "server-only";

import type { User } from "@/lib/types";
import { createSupabaseServerClient } from "./server";
import { profileImageUrl } from "./storage";

export const DEFAULT_AVATAR = "/images/avatar.png";

/** "2026-09-02T..." → "2026.09.02" */
const formatDate = (iso: string) => iso.slice(0, 10).replaceAll("-", ".");

/** 로그인한 사용자와 프로필. 로그인하지 않았으면 null. */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profile")
    .select("nickname, image_path")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    nickname: profile?.nickname ?? user.email?.split("@")[0] ?? "이웃",
    email: user.email ?? "",
    avatarUrl: profile?.image_path ? profileImageUrl(profile.image_path) : DEFAULT_AVATAR,
    joinedAt: formatDate(user.created_at),
  };
}
