import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (postError) {
    return NextResponse.json({ error: "投稿を確認できませんでした。" }, { status: 500 });
  }

  if (!post) {
    return NextResponse.json({ error: "投稿が見つかりません。" }, { status: 404 });
  }

  const { error: publicPostError } = await auth.serviceClient
    .from("public_posts")
    .delete()
    .eq("source_post_id", id);

  if (publicPostError) {
    return NextResponse.json({ error: "関連する公開用データを削除できませんでした。" }, { status: 500 });
  }

  const { error: deleteError } = await auth.serviceClient.from("posts").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: "投稿を削除できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
