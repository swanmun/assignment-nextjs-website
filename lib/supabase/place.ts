import "server-only";

import {
  validatePlaceContent,
  validatePlaceImage,
  validatePlaceImageCount,
  validatePlaceName,
} from "@/lib/place-rules";
import type { Place, PlacePage } from "@/lib/types";
import { DEFAULT_AVATAR } from "./auth";
import { createSupabaseServerClient } from "./server";
import { PLACE_IMAGE_BUCKET, placeImageUrl, profileImageUrl, storagePath } from "./storage";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/** 목록 한 묶음 크기 (무한 스크롤) */
export const PLACE_PAGE_SIZE = 12;
const SUMMARY_LENGTH = 60;

const PLACE_COLUMNS = "id, created_at, name, content, address, user_id, place_image(id, image_path, sort_order)";

type PlaceImageRow = { id: string; image_path: string; sort_order: number };
type PlaceRow = {
  id: string;
  created_at: string;
  name: string;
  content: string;
  address: string;
  user_id: string;
  place_image: PlaceImageRow[];
};
type ProfileRow = { user_id: string; nickname: string | null; image_path: string | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isPlaceId = (id: string) => UUID.test(id);

/** 한국 시간 기준 "YYYY.MM.DD" */
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }).replaceAll("-", ".");

const summarize = (content: string) => {
  const line = content.replace(/\s+/g, " ").trim();
  return line.length > SUMMARY_LENGTH ? `${line.slice(0, SUMMARY_LENGTH)}…` : line;
};

export const sortImages = (images: PlaceImageRow[]) => [...images].sort((a, b) => a.sort_order - b.sort_order);

const toPlace = (row: PlaceRow, profile: ProfileRow | undefined): Place => {
  const createdAt = formatDate(row.created_at);
  return {
    id: row.id,
    name: row.name,
    content: row.content,
    summary: summarize(row.content),
    address: row.address,
    authorId: row.user_id,
    author: profile?.nickname ?? "이웃",
    authorAvatarUrl: profile?.image_path ? profileImageUrl(profile.image_path) : DEFAULT_AVATAR,
    date: createdAt.slice(5),
    createdAt,
    photos: sortImages(row.place_image).map((image) => ({ id: image.id, url: placeImageUrl(image.image_path) })),
  };
};

/** place에서 profile로 가는 외래키가 없어 작성자 프로필은 한 번에 따로 읽는다. */
async function withAuthors(supabase: ServerClient, rows: PlaceRow[]): Promise<Place[]> {
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  if (userIds.length === 0) return [];
  const { data } = await supabase.from("profile").select("user_id, nickname, image_path").in("user_id", userIds);
  const profiles = new Map(((data ?? []) as ProfileRow[]).map((profile) => [profile.user_id, profile]));
  return rows.map((row) => toPlace(row, profiles.get(row.user_id)));
}

/** 이름·내용·주소에서 찾는다. 입력값은 LIKE 와일드카드와 PostgREST 필터 문법을 모두 이스케이프한다. */
const searchFilter = (query: string) => {
  const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  const quoted = `"${pattern.replace(/[\\"]/g, "\\$&")}"`;
  return ["name", "content", "address"].map((column) => `${column}.ilike.${quoted}`).join(",");
};

type ListOptions = {
  query?: string;
  /** 이전 묶음 마지막 글의 created_at. 이보다 오래된 글을 읽는다. */
  cursor?: string;
  /** 이 사용자가 쓴 글만 */
  userId?: string;
  /** 생략하면 전부 읽는다. */
  limit?: number;
};

/** 최신순 맛집 목록. 커서가 없는 첫 묶음에만 전체 개수(total)를 담는다. 소프트삭제된 글은 빼고 읽는다. */
export async function listPlaces({ query, cursor, userId, limit }: ListOptions = {}): Promise<PlacePage> {
  const supabase = await createSupabaseServerClient();
  let request = supabase
    .from("place")
    .select(PLACE_COLUMNS, { count: cursor ? undefined : "exact" })
    .is("deleted_at", null);
  if (query) request = request.or(searchFilter(query));
  if (userId) request = request.eq("user_id", userId);
  if (cursor) request = request.lt("created_at", cursor);
  request = request.order("created_at", { ascending: false }).order("id", { ascending: false });
  // 한 개 더 읽어 다음 묶음이 있는지 본다.
  if (limit) request = request.limit(limit + 1);

  const { data, count, error } = await request;
  if (error) throw new Error(`맛집 목록을 읽지 못했어요: ${error.message}`);

  const rows = data as PlaceRow[];
  const hasMore = limit !== undefined && rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  return {
    places: await withAuthors(supabase, pageRows),
    nextCursor: hasMore ? pageRows[pageRows.length - 1].created_at : null,
    total: count ?? undefined,
  };
}

/** 맛집 상세. 없거나 소프트삭제됐으면 null */
export async function getPlace(id: string): Promise<Place | null> {
  if (!isPlaceId(id)) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("place")
    .select(PLACE_COLUMNS)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(`맛집을 읽지 못했어요: ${error.message}`);
  if (!data) return null;
  const [place] = await withAuthors(supabase, [data as PlaceRow]);
  return place;
}

/** 수정·삭제 권한 확인용: 작성자와 지금 붙어 있는 사진. 소프트삭제된 글은 null */
export async function getPlaceOwnership(supabase: ServerClient, id: string) {
  if (!isPlaceId(id)) return null;
  const { data } = await supabase
    .from("place")
    .select("user_id, place_image(id, image_path, sort_order)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return data as Pick<PlaceRow, "user_id" | "place_image"> | null;
}

export type PlaceInput = { name: string; content: string; files: File[] };

/**
 * multipart 본문(name, content, images[])을 읽어 검증한다.
 * keptImageCount: 수정할 때 남겨 둘 기존 사진 수 (사진 장수 규칙에 함께 센다)
 */
export function readPlaceForm(formData: FormData, keptImageCount = 0): { input: PlaceInput } | { message: string } {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  const name = text("name");
  const content = text("content");
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);

  const message =
    validatePlaceName(name) ??
    validatePlaceContent(content) ??
    validatePlaceImageCount(keptImageCount + files.length) ??
    files.map(validatePlaceImage).find(Boolean);
  return message ? { message } : { input: { name, content, files } };
}

/** 사진을 place-image 버킷에 <uuidv4>.<ext>로 올리고 경로를 돌려준다. 하나라도 실패하면 올린 것을 지우고 null */
export async function uploadPlaceImages(supabase: ServerClient, files: File[]): Promise<string[] | null> {
  const storage = supabase.storage.from(PLACE_IMAGE_BUCKET);
  const results = await Promise.all(
    files.map(async (file) => {
      const path = storagePath(file.type);
      const { error } = await storage.upload(path, file, { contentType: file.type });
      return error ? null : path;
    }),
  );
  const paths = results.filter((path): path is string => path !== null);
  if (paths.length === files.length) return paths;
  await removePlaceImages(supabase, paths);
  return null;
}

/** 스토리지에서 사진 파일을 지운다. 실패해도 글 저장에는 영향이 없으므로 결과를 보지 않는다. */
export async function removePlaceImages(supabase: ServerClient, paths: string[]) {
  if (paths.length > 0) await supabase.storage.from(PLACE_IMAGE_BUCKET).remove(paths);
}
