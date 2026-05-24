import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = verifyAdminRequest(request);

  if (!auth.ok) {
    return NextResponse.json(
      {
        ok: false,
        code: auth.code,
        message: auth.message
      },
      { status: auth.status }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "管理者ログイン済みです。"
  });
}
