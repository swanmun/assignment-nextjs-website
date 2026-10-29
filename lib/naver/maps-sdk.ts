/**
 * 네이버 지도 JavaScript API v3 (NCP Maps · Dynamic Map) 로더. 브라우저 전용.
 * Client ID는 브라우저에 그대로 노출되는 공개 값이고, NCP 콘솔의 Web 서비스 URL 등록으로 쓸 곳을 제한한다.
 */

/** 이 프로젝트가 쓰는 SDK 범위만 적은 타입 */
export type NaverLatLng = { lat(): number; lng(): number };

export type NaverMap = {
  getCenter(): NaverLatLng;
  setCenter(center: NaverLatLng): void;
  destroy(): void;
};

type NaverMapListener = unknown;

export type NaverMapsSdk = {
  Map: new (
    element: HTMLElement,
    options: { center: NaverLatLng; zoom: number; scaleControl?: boolean; mapDataControl?: boolean },
  ) => NaverMap;
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Event: {
    addListener(target: NaverMap, type: string, listener: () => void): NaverMapListener;
    removeListener(listener: NaverMapListener): void;
  };
};

declare global {
  interface Window {
    naver?: { maps?: NaverMapsSdk };
    /** 키가 틀렸거나 등록되지 않은 URL에서 지도를 그리면 SDK가 호출한다. */
    navermap_authFailure?: () => void;
  }
}

/** NCP 콘솔 > Maps > Application의 Client ID (NCP_MAP_KEY_ID와 같은 값) */
const KEY_ID = process.env.NEXT_PUBLIC_NCP_MAP_KEY_ID ?? "";

let loading: Promise<NaverMapsSdk> | undefined;
let authFailed = false;
const authFailureListeners = new Set<() => void>();

/** SDK 스크립트를 한 번만 불러온다. 키가 없거나 불러오지 못하면 reject */
export const loadNaverMaps = (): Promise<NaverMapsSdk> => {
  if (!KEY_ID || authFailed) return Promise.reject(new Error("지도를 쓸 수 없어요."));
  if (window.naver?.maps) return Promise.resolve(window.naver.maps);
  if (loading) return loading;

  window.navermap_authFailure = () => {
    authFailed = true;
    authFailureListeners.forEach((listener) => listener());
  };
  loading = new Promise<NaverMapsSdk>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(KEY_ID)}`;
    script.async = true;
    script.onload = () => (window.naver?.maps ? resolve(window.naver.maps) : reject(new Error("지도를 불러오지 못했어요.")));
    script.onerror = () => {
      // 다음에 다시 시도할 수 있게 비운다.
      script.remove();
      loading = undefined;
      reject(new Error("지도를 불러오지 못했어요."));
    };
    document.head.appendChild(script);
  });
  return loading;
};

/** 지도 인증 실패(SDK는 불러왔지만 키·URL이 맞지 않음)를 구독한다. 이미 실패했으면 바로 알린다. */
export const onNaverMapsAuthFailure = (listener: () => void) => {
  if (authFailed) listener();
  authFailureListeners.add(listener);
  return () => {
    authFailureListeners.delete(listener);
  };
};
