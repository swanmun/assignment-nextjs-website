import "server-only";

/** NCP Static Map 한 변 최대 픽셀 (scale 2면 실제 이미지는 두 배) */
export const STATIC_MAP_MAX_SIZE = 1024;
const LEVEL = 16;

export type StaticMapRequest = {
  latitude: number;
  longitude: number;
  width: number;
  height: number;
};

/**
 * 가운데에 핀을 꽂은 지도 이미지 (NCP Maps Static Map, 서버 전용 키).
 * 키가 없거나 요청이 실패하면 null
 */
export async function fetchStaticMap({ latitude, longitude, width, height }: StaticMapRequest): Promise<Response | null> {
  const keyId = process.env.NCP_MAP_KEY_ID;
  const key = process.env.NCP_MAP_KEY;
  if (!keyId || !key) return null;

  const center = `${longitude},${latitude}`;
  const marker = `type:d|size:mid|pos:${longitude} ${latitude}`;
  const query = [
    `w=${width}`,
    `h=${height}`,
    `center=${center}`,
    `level=${LEVEL}`,
    "scale=2",
    "format=png",
    "lang=ko",
    `markers=${encodeURIComponent(marker)}`,
  ].join("&");

  const response = await fetch(`https://maps.apigw.ntruss.com/map-static/v2/raster?${query}`, {
    headers: { "x-ncp-apigw-api-key-id": keyId, "x-ncp-apigw-api-key": key },
    cache: "no-store",
  });
  return response.ok ? response : null;
}
