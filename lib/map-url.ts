import type { PlaceLocation } from "./place-rules";

type Point = Pick<PlaceLocation, "latitude" | "longitude">;

/** 지도 이미지 BFF(GET /api/map) 주소. 크기는 CSS 픽셀 기준이고, 서버가 2배 해상도로 받아 온다. */
export const mapImageUrl = ({ latitude, longitude }: Point, width: number, height: number) =>
  `/api/map?lat=${latitude.toFixed(7)}&lng=${longitude.toFixed(7)}&w=${width}&h=${height}`;

/** 네이버 지도에서 크게 보기 */
export const naverMapUrl = (query: string) => `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
