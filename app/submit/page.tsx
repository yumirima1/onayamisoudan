import type { Metadata } from "next";
import { SafetyNotice } from "@/components/SafetyNotice";
import { SubmitForm } from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "悩みを送る",
  description: "匿名で悩みを投稿できます。原文は管理者だけが確認します。"
};

export default function SubmitPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-night-text">匿名で書く</h1>
        <p className="leading-8 text-night-muted">
          個人名、学校名、勤務先、住所、連絡先など、あなたや他の人を特定できる情報はできるだけ書かないでください。
        </p>
        <SafetyNotice />
      </div>
      <SubmitForm />
    </div>
  );
}
