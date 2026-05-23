"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { verifyAdminSession } from "@/lib/adminSessionClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState("");
  const [step, setStep] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setDetail("");
    setStep("Supabase Auth に接続中...");

    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage("ログインできませんでした。");
        setDetail(error.message);
        return;
      }

      const user = data.user;

      if (!user) {
        setMessage("ログイン情報を確認できませんでした。");
        setDetail("Supabase Auth returned no user after signInWithPassword.");
        return;
      }

      setStep(`Supabase Auth ログイン成功。auth user.id: ${user.id}`);

      setStep(`管理者権限を確認中... auth user.id: ${user.id}`);
      const adminSession = await verifyAdminSession();

      if (!adminSession.ok) {
        await supabase.auth.signOut();
        setMessage("管理者権限を確認できませんでした。");
        setDetail(
          [
            adminSession.message ?? `admin_profiles にこの id が登録されていません: ${user.id}`,
            adminSession.detail ? `詳細: ${adminSession.detail}` : null,
            adminSession.rlsWarning ? `RLS確認: ${adminSession.rlsWarning}` : null
          ]
            .filter(Boolean)
            .join("\n")
        );
        return;
      }

      window.sessionStorage.setItem(
        "adminLoginDiagnostic",
        JSON.stringify({
          userId: adminSession.userId ?? user.id,
          rlsWarning: adminSession.rlsWarning ?? null,
          checkedAt: new Date().toISOString()
        })
      );
      setStep(`ログイン成功。管理画面へ移動します... auth user.id: ${adminSession.userId ?? user.id}`);
      router.push("/admin");
      router.refresh();
    } catch (unknownError) {
      const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
      setMessage("ログイン処理中に予期しないエラーが発生しました。");
      setDetail(error.message);
    } finally {
      setLoading(false);
    }
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
        {step ? <p className="text-sm text-night-muted">{step}</p> : null}
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
