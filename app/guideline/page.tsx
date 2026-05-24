import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ガイドライン",
  description: "投稿、返信、公開アーカイブのガイドライン。",
  alternates: {
    canonical: "/guideline"
  }
};

export default function GuidelinePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-5 sm:py-14">
      <h1 className="break-words text-3xl font-semibold text-night-text">ガイドライン</h1>
      <div className="mt-6 space-y-5 break-words leading-8 text-night-muted">
        <p>このサイトは医療・診断・治療サービスではありません。返信では診断名の断定、治療効果の断定、医療判断の代替になる表現を扱いません。</p>
        <p>公開アーカイブには、投稿者が公開を希望し、管理者が確認した相談だけを掲載します。個人が特定されそうな内容や、公開しない方がよい内容は掲載しません。</p>
        <p>差し迫った危険がある場合は、この場所の返信を待たずに、地域の緊急窓口、公的相談窓口、信頼できる身近な人への連絡を優先してください。</p>
      </div>
    </div>
  );
}
