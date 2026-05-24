"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const password = String(formData.get("password") ?? "");
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setMessage(payload?.message ?? "管理者ログインに失敗しました。");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setMessage("管理者ログイン処理中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-3xl font-semibold text-night-text">管理者ログイン</h1>
      <p className="mt-4 leading-7 text-night-muted">本番前の簡易ログインです。パスワードはサーバー側の環境変数だけで確認します。</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-lg border border-white/10 bg-night-card p-6">
        <label className="block space-y-2 text-sm text-night-muted">
          <span>管理者パスワード</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-night-accent"
          />
        </label>
        <button disabled={loading} className="rounded-md bg-night-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? "確認中..." : "ログイン"}
        </button>
        {message ? (
          <div className="rounded-md border border-red-300/30 bg-red-950/20 p-4 text-sm text-red-100">
            <p className="font-semibold">{message}</p>
          </div>
        ) : null}
      </form>
    </div>
  );
}
