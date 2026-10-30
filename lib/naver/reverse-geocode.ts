import "server-only";

import type { PlaceAddress, PlaceLocation } from "@/lib/types";

type Area = { name: string };

type GeocodeResult = {
  /** 변환 종류: addr(지번) · roadaddr(도로명) */
  name: string;
  /** area1 시·도 · area2 시·군·구 · area3 읍·면·동 · area4 리 */
  region: { area1: Area; area2: Area; area3: Area; area4: Area };
  land?: {
    /** 지번만: "1" 일반 · "2" 산 */
    type: string;
    /** 도로명만: 도로 이름 */
    name: string;
    number1: string;
    number2: string;
  };
};

export class ReverseGeocodeUnavailableError extends Error {}

/** "45", "12" → "45-12" */
const lotNumber = (number1: string, number2: string) => (number2 ? `${number1}-${number2}` : number1);

/** "서울특별시 구로구 오류동 45-12" (시·도 시·군·구 읍·면·동 리 [산] 번지) */
const jibunAddress = ({ region, land }: GeocodeResult) => {
  if (!land?.number1) return "";
  const lot = `${land.type === "2" ? "산 " : ""}${lotNumber(land.number1, land.number2)}`;
  return [region.area1.name, region.area2.name, region.area3.name, region.area4.name, lot].filter(Boolean).join(" ");
};

/** "서울특별시 구로구 오류로8길 22" (시·도 시·군·구 [읍·면] 도로명 건물번호. 동·리는 넣지 않는다) */
const roadAddress = ({ region, land }: GeocodeResult) => {
  if (!land?.name || !land.number1) return "";
  const town = /[읍면]$/.test(region.area3.name) ? region.area3.name : "";
  return [region.area1.name, region.area2.name, town, land.name, lotNumber(land.number1, land.number2)].filter(Boolean).join(" ");
};

/**
 * 좌표 → 주소 (NCP Maps Reverse Geocoding, 서버 전용 키). 바다·산처럼 상세 주소가 없는 곳이면 null.
 * 키가 없으면 ReverseGeocodeUnavailableError를 던진다.
 */
export async function reverseGeocode({ latitude, longitude }: Pick<PlaceLocation, "latitude" | "longitude">): Promise<PlaceAddress | null> {
  const keyId = process.env.NCP_MAP_KEY_ID;
  const key = process.env.NCP_MAP_KEY;
  if (!keyId || !key) {
    throw new ReverseGeocodeUnavailableError("NCP_MAP_KEY_ID, NCP_MAP_KEY 환경변수가 필요합니다.");
  }

  // https://api.ncloud-docs.com/docs/application-maps-reversegeocoding
  const url = new URL("https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc");
  url.searchParams.set("coords", `${longitude},${latitude}`);
  url.searchParams.set("orders", "roadaddr,addr");
  url.searchParams.set("output", "json");
  const response = await fetch(url, {
    headers: { "x-ncp-apigw-api-key-id": keyId, "x-ncp-apigw-api-key": key },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`네이버 리버스 지오코딩 실패: ${response.status}`);

  // 결과가 없으면 status.code 3과 함께 results가 비어 온다.
  const { results = [] } = (await response.json()) as { results?: GeocodeResult[] };
  const road = results.find((result) => result.name === "roadaddr");
  const lot = results.find((result) => result.name === "addr");
  const roadText = road ? roadAddress(road) : "";
  const jibunText = lot ? jibunAddress(lot) : "";
  if (!roadText && !jibunText) return null;
  return {
    address: roadText || jibunText,
    jibunAddress: roadText && jibunText ? jibunText : null,
  };
}
