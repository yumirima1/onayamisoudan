import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth";

const postSelect =
  "id, created_at, nickname, age_group, category, title, body, urgency, allow_public, allow_stream, admin_reply, admin_memo, public_draft_title, public_draft_body, public_draft_reply, risk_flags, ai_summary, ai_drafts, status, replied_at";

const publicPostSelect =
  "id, source_post_id, published_at, public_title, public_body, public_reply, category, archive_status, is_stream_used, stream_url";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message, code: auth.code }, { status: auth.status });
  }

  const { id } = await params;
  const { data: post, error: postError } = await auth.serviceClient.from("posts").select(postSelect).eq("id", id).maybeSingle();

  if (postError) {
    return NextResponse.json({ error: "投稿を取得できませんでした。" }, { status: 500 });
  }

  if (!post) {
    return NextResponse.json({ error: "投稿が見つかりません。" }, { status: 404 });
  }

  const { data: publicPost, error: publicPostError } = await auth.serviceClient
    .from("public_posts")
    .select(publicPostSelect)
    .eq("source_post_id", id)
    .maybeSingle();

  if (publicPostError) {
    return NextResponse.json({ error: "公開用データを取得できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({ post, publicPost: publicPost ?? null });
}
