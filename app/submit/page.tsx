import type { Metadata } from "next";
import { SafetyNotice } from "@/components/SafetyNotice";
import { SubmitForm } from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "悩みを送る",
  description: "匿名で悩みを投稿できます。原文は管理者だけが確認します。",
  alternates: {
    canonical: "/submit"
  }
};

export default function SubmitPage() {
  return (
    <div className="mx-auto grid max-w-5xl min-w-0 gap-8 px-4 py-10 sm:px-5 sm:py-14 lg:grid-cols-[0.78fr_1.22fr]">
      <div className="min-w-0 space-y-6 lg:pt-4">
        <p className="text-sm font-medium tracking-[0.08em] text-night-warm">投稿フォーム</p>
        <h1 className="break-words text-3xl font-semibold leading-tight text-night-text">匿名で書く</h1>
        <p className="break-words text-base leading-8 text-night-muted">
          個人名、学校名、勤務先、住所、連絡先など、あなたや他の人を特定できる情報はできるだけ書かないでください。
        </p>
        <p className="break-words text-sm leading-7 text-night-muted">
          まとまった文章でなくても大丈夫です。送信後に表示される返信確認URLは、必要なら自分だけが見られる場所に保存してください。
        </p>
        <SafetyNotice />
      </div>
      <SubmitForm />
    </div>
  );
}
