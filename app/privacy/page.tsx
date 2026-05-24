import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシー",
  description: "投稿原文、返信確認URL、公開アーカイブの扱いについて。",
  alternates: {
    canonical: "/privacy"
  }
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-5 sm:py-14">
      <h1 className="break-words text-3xl font-semibold text-night-text">プライバシー</h1>
      <div className="mt-6 space-y-5 break-words leading-8 text-night-muted">
        <p>投稿原文は非公開で保存し、管理者だけが確認します。公開アーカイブには、投稿者が公開を希望し、管理者が確認した相談だけを掲載します。</p>
        <p>返信確認URLは投稿後に一度だけ表示されます。URLを知っている人だけが、本人向けの返信確認ページを開けます。</p>
        <p>公開ページには、メールアドレス、管理メモ、内部ステータス、token情報を表示しません。</p>
      </div>
    </div>
  );
}
