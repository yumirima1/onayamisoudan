import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, createAdminSessionValue, verifyAdminPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const verified = verifyAdminPassword(password);

  if (!verified.ok) {
    return NextResponse.json(
      {
        ok: false,
        code: verified.code,
        message:
          verified.code === "admin_password_unconfigured"
            ? "管理者パスワードがサーバー側に設定されていません。"
            : "管理者パスワードが違います。"
      },
      { status: verified.code === "admin_password_unconfigured" ? 500 : 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE
  });

  return response;
}
