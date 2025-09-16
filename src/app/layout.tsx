import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "24時間限定アルバム",
  description: "年に一度だけ開く、あなたの大切な記憶の宝箱。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#0B192F] text-cream font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
