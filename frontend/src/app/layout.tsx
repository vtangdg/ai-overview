import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { PageTracker } from "../components/analytics/PageTracker";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "AI 知识库",
  description: "探索人工智能的世界，从概念学习到工具应用，一站式AI知识平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="zh-CN">
      <body
        className={geistSans.className}
      >
        {/* 页面访问统计追踪器 - 客户端组件 */}
        <PageTracker />
        {children}
      </body>
    </html>
  );
}
