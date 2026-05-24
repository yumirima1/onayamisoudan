"use client";

import { FormEvent, useState } from "react";
import { normalizeEmpty, submitPostSchema } from "@/lib/validation";

const ageGroups = ["中学生", "高校生", "大学生", "社会人", "その他", "答えたくない"];
const categories = ["学校", "人間関係", "家族", "恋愛", "将来", "気分", "ただ聞いてほしい", "その他"];

export function SubmitForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [submittedUrgency, setSubmittedUrgency] = useState<"normal" | "soon" | "risky">("normal");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const urgency = String(formData.get("urgency") ?? "normal");
    const parsed = submitPostSchema.safeParse({
      nickname: normalizeEmpty(String(formData.get("nickname") ?? "")),
      email: normalizeEmpty(String(formData.get("email") ?? "")),
      age_group: normalizeEmpty(String(formData.get("age_group") ?? "")),
      category: String(formData.get("category") ?? ""),
      title: String(formData.get("title") ?? ""),
      body: String(formData.get("body") ?? ""),
      urgency,
      allow_public: formData.get("allow_public") === "on",
      allow_stream: formData.get("allow_stream") === "on"
    });

    if (!parsed.success) {
      setStatus("error");
      setMessage("入力内容を確認してください。タイトルは80文字以内、本文は2000文字以内です。");
      return;
    }

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsed.data)
    });

    if (!response.ok) {
      setStatus("error");
      setMessage("送信できませんでした。時間を置いてもう一度お試しください。");
      return;
    }

    event.currentTarget.reset();
    setSubmittedUrgency(parsed.data.urgency);
    setStatus("done");
    setMessage("投稿ありがとうございました。すべてに返信できるよう努力しますが、緊急時は専門機関に相談してください。");
  }

  if (status === "done") {
    return (
      <div className="space-y-5 rounded-lg border border-white/10 bg-night-card p-6 shadow-quiet">
        <h2 className="text-2xl font-semibold text-night-text">投稿ありがとうございました</h2>
        <p className="leading-8 text-night-muted">{message}</p>
        {submittedUrgency === "risky" ? (
          <div className="rounded-lg border border-red-300/40 bg-red-950/30 p-5 text-red-100">
            <h3 className="font-semibold">今すぐの安全を優先してください</h3>
            <p className="mt-2 text-sm leading-7">
              自分や誰かを傷つけそうな時、暴力や危険が迫っている時は、地域の緊急窓口、警察・消防、公的相談窓口、信頼できる身近な人に連絡してください。
            </p>
          </div>
        ) : null}
        <button onClick={() => setStatus("idle")} className="rounded-md border border-white/15 px-4 py-2 text-sm text-night-text hover:bg-white/10">
          もう一度投稿する
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-white/10 bg-night-card p-6 shadow-quiet">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-night-muted">
          <span>ニックネーム 任意</span>
          <input name="nickname" maxLength={40} className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-night-accent" />
        </label>
        <label className="space-y-2 text-sm text-night-muted">
          <span>年齢層 任意</span>
          <select name="age_group" className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-night-accent">
            <option value="">選択しない</option>
            {ageGroups.map((ageGroup) => (
              <option key={ageGroup} value={ageGroup}>
                {ageGroup}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="space-y-2 text-sm text-night-muted">
        <span>返信通知を受け取るメールアドレス 任意</span>
        <input
          name="email"
          type="email"
          maxLength={254}
          autoComplete="email"
          className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-night-accent"
        />
        <span className="block text-xs leading-6 text-night-muted">
          管理者が返信したことをお知らせするためだけに使います。メール本文に相談内容や返信本文は載せません。
        </span>
      </label>
      <label className="space-y-2 text-sm text-night-muted">
        <span>カテゴリ 必須</span>
        <select name="category" required className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-night-accent">
          <option value="">選択してください</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm text-night-muted">
        <span>タイトル 必須 80文字以内</span>
        <input name="title" required maxLength={80} className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-night-accent" />
      </label>
      <label className="space-y-2 text-sm text-night-muted">
        <span>本文 必須 2000文字以内</span>
        <textarea name="body" required maxLength={2000} rows={10} className="w-full resize-y rounded-md border border-white/10 bg-black/20 px-3 py-3 leading-7 outline-none focus:border-night-accent" />
      </label>
      <label className="space-y-2 text-sm text-night-muted">
        <span>緊急度 必須</span>
        <select name="urgency" required defaultValue="normal" className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-night-accent">
          <option value="normal">normal</option>
          <option value="soon">soon</option>
          <option value="risky">risky</option>
        </select>
      </label>
      <div className="space-y-3 rounded-md border border-white/10 bg-black/10 p-4 text-sm text-night-muted">
        <label className="flex gap-3">
          <input name="allow_public" type="checkbox" className="mt-1" />
          <span>匿名編集済みの形で公開アーカイブに使うことを許可します。</span>
        </label>
        <label className="flex gap-3">
          <input name="allow_stream" type="checkbox" className="mt-1" />
          <span>匿名編集済みの形で配信・紹介の候補にすることを許可します。</span>
        </label>
      </div>
      <button type="submit" disabled={status === "sending"} className="rounded-md bg-night-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {status === "sending" ? "送信中..." : "悩みを送る"}
      </button>
      {message ? <p className={status === "error" ? "text-sm text-red-200" : "text-sm text-emerald-200"}>{message}</p> : null}
    </form>
  );
}
