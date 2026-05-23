import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ガイドライン",
  description: "投稿、返信、公開アーカイブのガイドライン。"
};

export default function GuidelinePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-semibold text-night-text">ガイドライン</h1>
      <div className="mt-6 space-y-5 leading-8 text-night-muted">
        <p>このサイトは医療・診断・治療サービスではありません。返信では診断名の断定、治療効果の断定、医療判断の代替になる表現を扱いません。</p>
        <p>公開や配信に使う場合は、本人の許可がある投稿だけを対象にし、個人が特定されないよう編集します。</p>
        <p>差し迫った危険がある場合は、地域の緊急窓口、公的相談窓口、信頼できる身近な人への連絡を優先してください。</p>
      </div>
    </div>
  );
}
