import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message, code: auth.code }, { status: auth.status });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { streamUrl?: unknown; isStreamUsed?: unknown } | null;
  const streamUrl = typeof body?.streamUrl === "string" && body.streamUrl.trim() ? body.streamUrl.trim() : null;
  const isStreamUsed = Boolean(body?.isStreamUsed);

  const { error } = await auth.serviceClient
    .from("public_posts")
    .update({
      stream_url: streamUrl,
      is_stream_used: isStreamUsed
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "配信情報を保存できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
