import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth";

const postSelect =
  "id, created_at, nickname, age_group, category, title, body, urgency, allow_public, allow_stream, admin_reply, admin_memo, public_draft_title, public_draft_body, public_draft_reply, risk_flags, ai_summary, ai_drafts, status, replied_at";

export async function GET(request: NextRequest) {
  const auth = requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message, code: auth.code }, { status: auth.status });
  }

  const limit = Number(request.nextUrl.searchParams.get("limit"));
  let query = auth.serviceClient.from("posts").select(postSelect).order("created_at", { ascending: false });

  if (Number.isFinite(limit) && limit > 0) {
    query = query.limit(Math.min(limit, 100));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "投稿一覧を取得できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}
