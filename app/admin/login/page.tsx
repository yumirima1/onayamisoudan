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
    <div className="mx-auto max-w-md px-4 py-12 sm:px-5 sm:py-16">
      <h1 className="break-words text-3xl font-semibold text-night-text">管理者ログイン</h1>
      <p className="mt-4 break-words leading-7 text-night-muted">
        管理者用パスワードをサーバー側で確認し、ログイン中は httpOnly Cookie で管理します。Supabase Auth は使っていません。
      </p>
      <form onSubmit={handleSubmit} className="mt-8 min-w-0 space-y-5 overflow-hidden rounded-lg border border-white/10 bg-night-card p-4 sm:p-6">
        <input name="username" type="text" autoComplete="username" defaultValue="admin" className="hidden" tabIndex={-1} aria-hidden="true" />
        <label className="block space-y-2 text-sm text-night-muted">
          <span>管理者パスワード</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full min-w-0 rounded-md border border-white/10 bg-black/20 px-3 py-3 text-base outline-none focus:border-night-accent"
          />
        </label>
        <button disabled={loading} className="w-full rounded-md bg-night-accent px-5 py-3 text-sm font-semibold text-night-background disabled:opacity-60 sm:w-auto">
          {loading ? "確認中..." : "ログイン"}
        </button>
        {message ? (
          <div className="break-words rounded-md border border-red-300/30 bg-red-950/20 p-4 text-sm leading-7 text-red-100">
            <p className="font-semibold">{message}</p>
          </div>
        ) : null}
      </form>
    </div>
  );
}
