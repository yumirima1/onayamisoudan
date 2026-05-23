"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setDetail("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setMessage("ログインできませんでした。");
      setDetail(error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      setLoading(false);
      setMessage("ログイン情報を確認できませんでした。");
      setDetail("Supabase Auth returned no user after signInWithPassword.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", user.id)
      .eq("is_active", true)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setLoading(false);
      setMessage("管理者権限を確認できませんでした。");
      setDetail(
        profileError?.message ??
          "public.admin_profiles にログインユーザーの id が存在しないか、is_active が false です。"
      );
      return;
    }

    setLoading(false);
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
        {message ? (
          <div className="rounded-md border border-red-300/30 bg-red-950/20 p-4 text-sm text-red-100">
            <p className="font-semibold">{message}</p>
            {detail ? <p className="mt-2 break-words text-red-100/80">{detail}</p> : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}
