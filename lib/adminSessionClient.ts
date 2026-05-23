"use client";

import { supabase } from "@/lib/supabaseClient";

export type AdminSessionResult = {
  ok: boolean;
  code?: string;
  status?: number;
  userId?: string;
  profile?: {
    id: string;
    role: string;
    is_active: boolean;
  };
  rlsProfileReadable?: boolean;
  message?: string;
  detail?: string | null;
  rlsWarning?: string | null;
};

export async function verifyAdminSession(): Promise<AdminSessionResult> {
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return {
      ok: false,
      code: "client_session_missing",
      message: "ログインセッションが見つかりません。",
      detail: sessionError?.message ?? null
    };
  }

  const response = await fetch("/api/admin/session", {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  const payload = (await response.json().catch(() => null)) as AdminSessionResult | null;

  if (!response.ok || !payload?.ok) {
    return {
      ok: false,
      code: payload?.code,
      status: response.status,
      userId: payload?.userId,
      message: payload?.message ?? "管理者セッションを確認できませんでした。",
      detail: payload?.detail ?? null,
      rlsProfileReadable: payload?.rlsProfileReadable ?? false,
      rlsWarning: payload?.rlsWarning ?? null
    };
  }

  return payload;
}
