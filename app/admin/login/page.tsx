"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { verifyAdminSession } from "@/lib/adminSessionClient";

type LoginDiagnostic = {
  supabaseUrl: string;
  input: string;
  auth: string;
  adminProfile: string;
  rls: string;
  userId?: string;
};

type SupabaseLoginError = {
  message: string;
  status?: number;
  code?: string;
  name?: string;
};

const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "未設定";

export default function AdminLoginPage() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState("");
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState("");
  const [step, setStep] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState<LoginDiagnostic>({
    supabaseUrl: publicSupabaseUrl,
    input: "未送信",
    auth: "未確認",
    adminProfile: "未確認",
    rls: "未確認"
  });

  const normalizedEmail = emailInput.trim().toLowerCase();

  function getAuthFailureDetail(error: SupabaseLoginError) {
    const statusText = error.status ? `HTTP ${error.status}` : "HTTP status 不明";
    const codeText = error.code ? ` / code: ${error.code}` : "";

    if (error.message === "Invalid login credentials") {
      return [
        `Supabase Auth のメール/パスワード認証で失敗しました（${statusText}${codeText}）。`,
        "この段階では admin_profiles や RLS はまだ確認していないため、管理者権限設定とは無関係です。",
        "signInWithPassword には、前後スペース削除・小文字化済みの email と、変換していない password を渡しています。",
        "Supabase Auth 側で、メールアドレス・パスワード・ユーザー作成状況・メール確認状態を確認してください。"
      ].join("\n");
    }

    return [
      `Supabase Auth のメール/パスワード認証で失敗しました（${statusText}${codeText}）。`,
      "この段階では admin_profiles や RLS はまだ確認していないため、管理者権限設定とは無関係です。",
      `Supabase Auth の詳細: ${error.message}`
    ].join("\n");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setDetail("");
    setStep("Supabase Auth に接続中...");

    try {
      const formData = new FormData(event.currentTarget);
      const rawEmail = String(formData.get("email") ?? "");
      const email = rawEmail.trim().toLowerCase();
      const password = String(formData.get("password") ?? "");
      setEmailInput(email);
      setDiagnostic({
        supabaseUrl: publicSupabaseUrl,
        input: `email: trim/toLowerCase 済み${rawEmail === email ? "（変更なし）" : "（入力値から正規化）"} / password: 無変換`,
        auth: "Supabase Auth password login 送信中",
        adminProfile: "未確認（Auth 成功後に確認）",
        rls: "未確認（Auth 成功後に確認）"
      });

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage("メールアドレスまたはパスワードが違います。");
        setDetail(getAuthFailureDetail(error));
        setDiagnostic((current) => ({
          ...current,
          auth: `失敗: Supabase Auth が認証を拒否しました${error.status ? `（HTTP ${error.status}）` : ""}`,
          adminProfile: "未確認（Auth 失敗のため到達していません）",
          rls: "未確認（Auth 失敗のため到達していません）"
        }));
        return;
      }

      const user = data.user;

      if (!user) {
        setMessage("ログイン情報を確認できませんでした。");
        setDetail("Supabase Auth returned no user after signInWithPassword.");
        setDiagnostic((current) => ({
          ...current,
          auth: "失敗: Supabase Auth は成功レスポンスを返しましたが user がありません",
          adminProfile: "未確認",
          rls: "未確認"
        }));
        return;
      }

      setStep(`Supabase Auth ログイン成功。auth user.id: ${user.id}`);
      setDiagnostic((current) => ({
        ...current,
        auth: "成功: Supabase Auth の password login を通過",
        adminProfile: "確認中: admin_profiles.id = auth.users.id を service key 経由で確認",
        rls: "確認中: ログインユーザー自身が RLS 経由で admin_profiles を読めるか確認",
        userId: user.id
      }));

      setStep(`管理者権限を確認中... auth user.id: ${user.id}`);
      const adminSession = await verifyAdminSession();

      if (!adminSession.ok) {
        await supabase.auth.signOut();
        setMessage("管理者権限を確認できませんでした。");
        setDetail(
          [
            `切り分け: Supabase Auth は成功済みです。ここから先は admin_profiles または RLS の問題です。`,
            adminSession.code ? `エラーコード: ${adminSession.code}` : null,
            adminSession.message ?? `admin_profiles にこの id が登録されていません: ${user.id}`,
            adminSession.detail ? `詳細: ${adminSession.detail}` : null,
            adminSession.rlsWarning ? `RLS確認: ${adminSession.rlsWarning}` : null
          ]
            .filter(Boolean)
            .join("\n")
        );
        setDiagnostic((current) => ({
          ...current,
          auth: "成功: Supabase Auth の password login を通過",
          adminProfile:
            adminSession.code === "admin_profile_not_found"
              ? "失敗: admin_profiles.id に auth.users.id と一致する行がありません"
              : adminSession.code === "admin_profile_inactive"
                ? "失敗: admin_profiles の is_active が false です"
                : "失敗: admin_profiles 確認でエラーが発生しました",
          rls: adminSession.rlsWarning
            ? `注意: ${adminSession.rlsWarning}`
            : adminSession.rlsProfileReadable
              ? "成功: RLS 経由でも admin_profiles を読めました"
              : "未確認または不可: 詳細は上のエラーを確認してください",
          userId: adminSession.userId ?? user.id
        }));
        return;
      }

      setDiagnostic((current) => ({
        ...current,
        auth: "成功: Supabase Auth の password login を通過",
        adminProfile: "成功: admin_profiles.id = auth.users.id の行があり、有効です",
        rls: adminSession.rlsWarning
          ? `注意: ${adminSession.rlsWarning}`
          : adminSession.rlsProfileReadable
            ? "成功: RLS 経由でも admin_profiles を読めました"
            : "未確認",
        userId: adminSession.userId ?? user.id
      }));

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
      setDiagnostic((current) => ({
        ...current,
        auth: "予期しないエラーで中断",
        adminProfile: "未確認または中断",
        rls: "未確認または中断"
      }));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    setMessage("");
    setDetail("");
    setStep("");

    if (!normalizedEmail) {
      setMessage("パスワード再設定にはメールアドレスを入力してください。");
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/admin/login`
      });

      if (error) {
        setMessage("パスワード再設定メールを送信できませんでした。");
        setDetail(`Supabase Auth: ${error.message}`);
        return;
      }

      setMessage("パスワード再設定メールを送信しました。");
      setDetail("入力したメールアドレスに届いたリンクから、Supabase Auth のパスワードを再設定してください。");
    } catch (unknownError) {
      const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
      setMessage("パスワード再設定処理中に予期しないエラーが発生しました。");
      setDetail(error.message);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-3xl font-semibold text-night-text">管理者ログイン</h1>
      <p className="mt-4 leading-7 text-night-muted">個別の Supabase Auth アカウントでログインしてください。共有パスワードは使いません。</p>
      <div className="mt-6 rounded-lg border border-white/10 bg-black/20 p-4 text-xs leading-6 text-night-muted">
        <p className="font-semibold text-night-text">ログイン診断</p>
        <dl className="mt-2 space-y-1">
          <div>
            <dt className="inline text-night-text">Supabase URL: </dt>
            <dd className="inline break-all">{diagnostic.supabaseUrl}</dd>
          </div>
          <div>
            <dt className="inline text-night-text">入力処理: </dt>
            <dd className="inline">{diagnostic.input}</dd>
          </div>
          <div>
            <dt className="inline text-night-text">Auth: </dt>
            <dd className="inline">{diagnostic.auth}</dd>
          </div>
          <div>
            <dt className="inline text-night-text">admin_profiles: </dt>
            <dd className="inline">{diagnostic.adminProfile}</dd>
          </div>
          <div>
            <dt className="inline text-night-text">RLS: </dt>
            <dd className="inline">{diagnostic.rls}</dd>
          </div>
          {diagnostic.userId ? (
            <div>
              <dt className="inline text-night-text">auth user.id: </dt>
              <dd className="inline break-all">{diagnostic.userId}</dd>
            </div>
          ) : null}
        </dl>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-lg border border-white/10 bg-night-card p-6">
        <label className="block space-y-2 text-sm text-night-muted">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            onBlur={() => setEmailInput(normalizedEmail)}
            required
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-night-accent"
          />
        </label>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>Password</span>
          <input name="password" type="password" required className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-night-accent" />
        </label>
        <button disabled={loading} className="rounded-md bg-night-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? "確認中..." : "ログイン"}
        </button>
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={loading || resetLoading}
            className="text-sm font-semibold text-night-accent underline-offset-4 hover:underline disabled:opacity-60"
          >
            {resetLoading ? "送信中..." : "パスワードを再設定する"}
          </button>
          <p className="mt-2 text-xs leading-5 text-night-muted">
            入力中のメールアドレスを小文字化して、Supabase Auth の再設定メールを送ります。
          </p>
        </div>
        {step ? <p className="text-sm text-night-muted">{step}</p> : null}
        {message ? (
          <div className="rounded-md border border-red-300/30 bg-red-950/20 p-4 text-sm text-red-100">
            <p className="font-semibold">{message}</p>
            {detail ? <p className="mt-2 whitespace-pre-line break-words text-red-100/80">{detail}</p> : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}
