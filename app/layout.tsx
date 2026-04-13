import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MomoPick — AI 배경 제거기",
  description: "AI가 이미지 배경을 자동으로 제거합니다. 무료, 브라우저에서 처리",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
