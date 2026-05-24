import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL || "http://localhost:3000"),
  title: {
    default: "よるの相談箱",
    template: "%s | よるの相談箱"
  },
  description: "匿名で悩みを静かに書き、管理者からの返信を専用URLで確認できる、夜の匿名相談箱です。",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "よるの相談箱",
    description: "匿名で悩みを静かに書き、管理者からの返信を専用URLで確認できる、夜の匿名相談箱です。",
    type: "website",
    locale: "ja_JP",
    siteName: "よるの相談箱"
  },
  twitter: {
    card: "summary",
    title: "よるの相談箱",
    description: "匿名で悩みを静かに書ける、深夜の手紙箱のような相談場所です。"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen font-sans antialiased">
        <div className="flex min-h-screen min-w-0 flex-col">
          <Header />
          <main className="min-w-0 flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
