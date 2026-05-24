import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message, code: auth.code }, { status: auth.status });
  }

  const { id } = await params;

  if (!id || id === "undefined") {
    return NextResponse.json({ error: "投稿IDが指定されていません。" }, { status: 400 });
  }

  const { data: post, error: postError } = await auth.serviceClient
    .from("posts")
    .update({ allow_public: false })
    .eq("id", id)
    .select("id, allow_public")
    .maybeSingle();

  if (postError) {
    return NextResponse.json({ error: "公開停止に失敗しました。" }, { status: 500 });
  }

  if (!post) {
    return NextResponse.json({ error: "投稿が見つかりません。" }, { status: 404 });
  }

  const { error: publicPostError } = await auth.serviceClient
    .from("public_posts")
    .update({ archive_status: "hidden" })
    .eq("source_post_id", id);

  if (publicPostError) {
    return NextResponse.json({ error: "公開用データの公開停止に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, allowPublic: false });
}
