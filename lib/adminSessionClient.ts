"use client";

export type AdminSessionResult = {
  ok: boolean;
  code?: string;
  message?: string;
  detail?: string | null;
};

export async function verifyAdminSession(): Promise<AdminSessionResult> {
  const response = await fetch("/api/admin/session", {
    credentials: "same-origin"
  });

  const payload = (await response.json().catch(() => null)) as AdminSessionResult | null;

  if (!response.ok || !payload?.ok) {
    return {
      ok: false,
      code: payload?.code,
      message: payload?.message ?? "管理者ログインが必要です。",
      detail: payload?.detail ?? null
    };
  }

  return payload;
}

export async function logoutAdminSession() {
  await fetch("/api/admin/logout", {
    method: "POST",
    credentials: "same-origin"
  });
}

export async function adminJsonFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers
    }
  });

  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;

  if (!response.ok) {
    throw new Error(response.status === 401 ? "管理者ログインが必要です。" : (payload?.error ?? "管理APIの実行に失敗しました。"));
  }

  return payload as T;
}
