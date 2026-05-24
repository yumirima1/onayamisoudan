import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message, code: auth.code }, { status: auth.status });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    publicPostId?: unknown;
    publicTitle?: unknown;
    publicBody?: unknown;
    publicReply?: unknown;
    category?: unknown;
    archiveStatus?: unknown;
    streamUsed?: unknown;
    streamUrl?: unknown;
  } | null;

  const publicPostId = typeof body?.publicPostId === "string" ? body.publicPostId : null;
  const publicTitle = typeof body?.publicTitle === "string" ? body.publicTitle : "";
  const publicBody = typeof body?.publicBody === "string" ? body.publicBody : "";
  const publicReply = typeof body?.publicReply === "string" ? body.publicReply : "";
  const category = typeof body?.category === "string" ? body.category : "";
  const archiveStatus = typeof body?.archiveStatus === "string" ? body.archiveStatus : "draft";
  const streamUsed = Boolean(body?.streamUsed);
  const streamUrl = typeof body?.streamUrl === "string" && body.streamUrl.trim() ? body.streamUrl.trim() : null;

  if (!publicTitle || !publicBody || !publicReply || !category) {
    return NextResponse.json({ error: "公開用データの入力が不足しています。" }, { status: 400 });
  }

  const payload = {
    source_post_id: id,
    public_title: publicTitle,
    public_body: publicBody,
    public_reply: publicReply,
    category,
    archive_status: archiveStatus,
    is_stream_used: streamUsed,
    stream_url: streamUrl,
    published_at: archiveStatus === "published" ? new Date().toISOString() : null
  };

  const query = publicPostId
    ? auth.serviceClient.from("public_posts").update(payload).eq("id", publicPostId).select().single()
    : auth.serviceClient.from("public_posts").insert(payload).select().single();

  const { data, error } = await query;

  if (error || !data) {
    return NextResponse.json({ error: "公開用データを保存できませんでした。" }, { status: 500 });
  }

  await auth.serviceClient
    .from("posts")
    .update({
      public_draft_title: publicTitle,
      public_draft_body: publicBody,
      public_draft_reply: publicReply
    })
    .eq("id", id);

  return NextResponse.json({ publicPost: data });
}
