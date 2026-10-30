import type { MetadataRoute } from "next";
import { APP_BACKGROUND_COLOR, APP_DESCRIPTION, APP_NAME, APP_SHORT_NAME, APP_THEME_COLOR } from "@/lib/pwa/config";

/** 홈 화면 설치·안드로이드 스플래시(name + background_color + 아이콘)를 정한다. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: APP_BACKGROUND_COLOR,
    theme_color: APP_THEME_COLOR,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
