import splashScreens from "./splash-screens.json";

/** 홈 화면 아이콘 아래 붙는 이름(짧은 이름)과 설치 화면에 보이는 전체 이름 */
export const APP_NAME = "숨은맛집.EXE";
export const APP_SHORT_NAME = "숨은맛집";
export const APP_DESCRIPTION = "서울 구로 주변, 주말에 차 타고 가볼 만한 숨은 맛집";

/*
 * 매니페스트·<meta>는 CSS 변수를 읽지 못해 값을 그대로 적는다. tokens.css와 같은 값으로 맞춘다.
 * scripts/make-app-icons.py도 아이콘·스플래시 배경을 tokens.css의 --color-neutral-200에서 읽는다.
 */
/** --color-background-default (neutral-200): 스플래시·아이콘 배경 */
export const APP_BACKGROUND_COLOR = "#e8e6d4";
/** --color-background-brand (brand-900): 상단 바와 같은 상태 표시줄 색 */
export const APP_THEME_COLOR = "#0a0a78";

/** 설치 띠배너에 쓰는 앱 아이콘 */
export const APP_ICON_URL = "/icons/icon-192.png";

/**
 * iOS 스플래시(apple-touch-startup-image). iOS는 매니페스트로 스플래시를 만들지 않아
 * 기기 화면 크기·방향마다 이미지를 지정해야 한다. 이미지는 scripts/make-app-icons.py가 만든다.
 */
export const APPLE_STARTUP_IMAGES = splashScreens.flatMap(({ width, height, ratio }) =>
  (["portrait", "landscape"] as const).map((orientation) => {
    const [w, h] = orientation === "portrait" ? [width * ratio, height * ratio] : [height * ratio, width * ratio];
    return {
      url: `/splash/${w}x${h}.png`,
      media: `screen and (device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: ${orientation})`,
    };
  }),
);
