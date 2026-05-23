import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "この場所について",
  description: "よるの相談箱の目的と運営方針について。"
};

export default function AboutPage() {
  return <InfoPage title="この場所について" body="ここは、匿名で悩みを書き、管理者が確認して返信するための場所です。公開アーカイブに掲載される場合も、原文ではなく匿名編集済みの公開専用データだけを使います。" />;
}

function InfoPage({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-semibold text-night-text">{title}</h1>
      <p className="mt-6 leading-8 text-night-muted">{body}</p>
    </div>
  );
}
