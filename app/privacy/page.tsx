import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシー",
  description: "投稿原文と公開データの扱い、管理者操作ログについて。"
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-semibold text-night-text">プライバシー</h1>
      <div className="mt-6 space-y-5 leading-8 text-night-muted">
        <p>投稿原文は非公開テーブルに保存し、管理者権限を持つアカウントだけが確認できます。</p>
        <p>公開ページは公開専用テーブルのみを参照し、投稿原文を表示しません。</p>
        <p>運営上必要な管理者操作は監査ログとして保存します。</p>
      </div>
    </div>
  );
}
