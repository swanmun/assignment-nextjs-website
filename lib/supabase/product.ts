import "server-only";

import type { Product } from "@/lib/types";
import { createSupabaseServerClient } from "./server";
import { productImageUrl } from "./storage";

/** 공개 상품만 읽는다(RLS product_select_public). 등록·수정은 대시보드에서 한다. */
const PUBLIC_STATUS = "Public";

const PRODUCT_COLUMNS =
  "id, name, description, event_at, address, capacity, price, image_path_main_lg, image_path_main_md, image_path_detail_lg, image_path_detail_md";

export type ProductRow = {
  id: string;
  name: string | null;
  description: string | null;
  event_at: string | null;
  address: string | null;
  capacity: number | null;
  /** numeric은 문자열로 온다 */
  price: string | number | null;
  image_path_main_lg: string;
  image_path_main_md: string;
  image_path_detail_lg: string;
  image_path_detail_md: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isProductId = (id: string) => UUID.test(id);

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 한국 시간 기준 "YYYY.MM.DD(요일) 오전 10:00" */
const formatEventAt = (iso: string) => {
  const date = new Date(iso);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  const weekday = WEEKDAYS[["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday)];
  const period = parts.dayPeriod === "AM" ? "오전" : "오후";
  return `${parts.year}.${parts.month}.${parts.day}(${weekday}) ${period} ${parts.hour}:${parts.minute}`;
};

const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name ?? "",
  description: row.description,
  eventAt: row.event_at,
  eventAtLabel: row.event_at ? formatEventAt(row.event_at) : null,
  address: row.address,
  capacity: row.capacity,
  price: productPrice(row),
  mainImage: { lg: productImageUrl(row.image_path_main_lg), md: productImageUrl(row.image_path_main_md) },
  detailImage: { lg: productImageUrl(row.image_path_detail_lg), md: productImageUrl(row.image_path_detail_md) },
});

/** 공개 상품 목록. 행사가 가까운 순(일시 미정은 뒤) */
export async function listProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("Product")
    .select(PRODUCT_COLUMNS)
    .eq("status", PUBLIC_STATUS)
    .order("event_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .returns<ProductRow[]>();
  if (error) throw new Error(`상품 목록을 불러오지 못했어요: ${error.message}`);
  return data.map(toProduct);
}

/** 공개 상품 행 그대로(이미지는 경로). 결제 스냅숏에 쓴다. 없거나 내려간 상품이면 null */
export async function getProductRow(id: string): Promise<ProductRow | null> {
  if (!isProductId(id)) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("Product")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .eq("status", PUBLIC_STATUS)
    .maybeSingle<ProductRow>();
  if (error) throw new Error(`상품을 불러오지 못했어요: ${error.message}`);
  return data;
}

/** 공개 상품 하나. 없거나 내려간 상품이면 null */
export async function getProduct(id: string): Promise<Product | null> {
  const row = await getProductRow(id);
  return row ? toProduct(row) : null;
}

/** 결제 금액(원). 가격이 없으면 결제할 수 없으므로 null */
export const productPrice = (row: Pick<ProductRow, "price">) => (row.price === null ? null : Number(row.price));
