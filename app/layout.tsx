import type { Metadata, Viewport } from "next";
import { APP_DESCRIPTION, APP_SHORT_NAME, APP_THEME_COLOR, APPLE_STARTUP_IMAGES } from "@/lib/pwa/config";
import "@/styles/tokens.css";
import "@/styles/typography.css";
import "@/styles/effects.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "숨은 맛집 커뮤니티",
  description: APP_DESCRIPTION,
  // 파비콘(app/favicon.ico, app/icon.png)·홈 화면 아이콘(app/apple-icon.png)·매니페스트(app/manifest.ts)는 파일 규칙으로 붙는다.
  appleWebApp: {
    capable: true,
    title: APP_SHORT_NAME,
    statusBarStyle: "default",
    startupImage: APPLE_STARTUP_IMAGES,
  },
  // Next는 mobile-web-app-capable만 출력한다. iOS 스플래시 이미지는 apple- 접두사 메타가 있어야 확실히 뜬다.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: APP_THEME_COLOR,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
