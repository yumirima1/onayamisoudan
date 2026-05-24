import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "この場所について",
  description: "よるの相談箱の目的、返信、公開アーカイブの考え方について。",
  alternates: {
    canonical: "/about"
  }
};

export default function AboutPage() {
  return (
    <InfoPage
      title="この場所について"
      body="よるの相談箱は、匿名で悩みを書き、管理者が確認して返信するための場所です。公開アーカイブに載るのは、投稿者が公開を希望し、管理者が確認した相談だけです。個人情報や管理用の情報は公開しません。"
    />
  );
}

function InfoPage({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-5 sm:py-14">
      <h1 className="break-words text-3xl font-semibold text-night-text">{title}</h1>
      <p className="mt-6 break-words leading-8 text-night-muted">{body}</p>
    </div>
  );
}
