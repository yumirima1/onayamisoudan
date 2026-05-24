import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
  description: "よるの相談箱の利用条件と注意事項。",
  alternates: {
    canonical: "/terms"
  }
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-5 sm:py-14">
      <h1 className="break-words text-3xl font-semibold text-night-text">利用規約</h1>
      <div className="mt-6 space-y-5 break-words leading-8 text-night-muted">
        <p>投稿者は、第三者の個人情報や権利を侵害する内容を投稿しないものとします。</p>
        <p>管理者は、公開に適さない投稿、個人特定のおそれがある内容、危険を助長する内容を公開しない、または公開停止することがあります。</p>
        <p>本サービスは緊急対応、医療相談、診断、治療を提供しません。</p>
      </div>
    </div>
  );
}
