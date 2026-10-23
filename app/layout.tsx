import type { Metadata } from "next";
import "@/styles/tokens.css";
import "@/styles/typography.css";
import "@/styles/effects.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "숨은 맛집 커뮤니티",
  description: "서울 구로 주변, 주말에 차 타고 가볼 만한 숨은 맛집",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
