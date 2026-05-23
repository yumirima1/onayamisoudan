"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setMessage("ログインできませんでした。");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-3xl font-semibold text-night-text">管理者ログイン</h1>
      <p className="mt-4 leading-7 text-night-muted">個別の Supabase Auth アカウントでログインしてください。共有パスワードは使いません。</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-lg border border-white/10 bg-night-card p-6">
        <label className="block space-y-2 text-sm text-night-muted">
          <span>Email</span>
          <input name="email" type="email" required className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-night-accent" />
        </label>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>Password</span>
          <input name="password" type="password" required className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-night-accent" />
        </label>
        <button disabled={loading} className="rounded-md bg-night-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? "確認中..." : "ログイン"}
        </button>
        {message ? <p className="text-sm text-red-200">{message}</p> : null}
      </form>
    </div>
  );
}
