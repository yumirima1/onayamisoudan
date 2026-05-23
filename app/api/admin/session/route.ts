import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";

type AdminProfile = {
  id: string;
  role: string;
  is_active: boolean;
};

export async function GET(request: NextRequest) {
  try {
    return await verifyAdminRequest(request);
  } catch (unknownError) {
    const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));

    return NextResponse.json(
      {
        ok: false,
        code: "unexpected_admin_session_error",
        message: "管理者セッション確認中に予期しないエラーが発生しました。",
        detail: error.message
      },
      { status: 500 }
    );
  }
}

async function verifyAdminRequest(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        code: "missing_token",
        message: "Supabase Auth のログインセッションが見つかりません。",
        rlsProfileReadable: false
      },
      { status: 401 }
    );
  }

  const userClient = createServerSupabase(token);
  const {
    data: { user },
    error: userError
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid_token",
        message: "Supabase Auth のユーザー確認に失敗しました。",
        detail: userError?.message ?? null,
        rlsProfileReadable: false
      },
      { status: 401 }
    );
  }

  let rlsWarning: string | null = null;
  const { data: rlsProfile, error: rlsProfileError } = await userClient
    .from("admin_profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle<AdminProfile>();

  if (rlsProfileError) {
    rlsWarning = `RLSまたはpolicyにより、ログインユーザーから admin_profiles を読めない可能性があります: ${rlsProfileError.message}`;
  }

  const serviceClient = createServiceSupabase();
  const { data: serviceProfile, error: serviceProfileError } = await serviceClient
    .from("admin_profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle<AdminProfile>();

  if (serviceProfileError) {
    return NextResponse.json(
      {
        ok: false,
        code: "admin_profile_lookup_failed",
        userId: user.id,
        message: "admin_profiles の確認中にエラーが発生しました。",
        detail: serviceProfileError.message,
        rlsProfileReadable: Boolean(rlsProfile),
        rlsWarning
      },
      { status: 500 }
    );
  }

  if (!serviceProfile) {
    return NextResponse.json(
      {
        ok: false,
        code: "admin_profile_not_found",
        userId: user.id,
        message: `Supabase Auth は成功しましたが、admin_profiles.id = auth.users.id の前提に合う行が見つかりません: ${user.id}`,
        rlsProfileReadable: Boolean(rlsProfile),
        rlsWarning
      },
      { status: 403 }
    );
  }

  if (!serviceProfile.is_active) {
    return NextResponse.json(
      {
        ok: false,
        code: "admin_profile_inactive",
        userId: user.id,
        message: "管理者アカウントが無効です",
        rlsProfileReadable: Boolean(rlsProfile),
        rlsWarning
      },
      { status: 403 }
    );
  }

  if (!rlsProfile && !rlsWarning) {
    rlsWarning = "admin_profiles はservice keyでは確認できましたが、RLS経由の同一ユーザー確認では行が見えませんでした。policyを確認してください。";
  }

  return NextResponse.json({
    ok: true,
    userId: user.id,
    profile: serviceProfile,
    rlsProfileReadable: Boolean(rlsProfile),
    rlsWarning
  });
}
