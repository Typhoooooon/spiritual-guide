import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "智者对话",
  description: "向千年前的智者提问，寻找属于你的答案",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Serif+SC:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-50 text-gray-900 font-sans min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
