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
  description: "匿名で悩みを言葉にできる、夜の投稿サイト。",
  openGraph: {
    title: "よるの相談箱",
    description: "匿名で悩みを言葉にできる、夜の投稿サイト。",
    type: "website",
    locale: "ja_JP",
    siteName: "よるの相談箱"
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
