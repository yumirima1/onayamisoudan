import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth";
import { sendReplyNotificationEmail } from "@/lib/mail";

type NotifyPost = {
  id: string;
  email: string | null;
  admin_reply: string | null;
  allow_public: boolean;
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message, code: auth.code }, { status: auth.status });
  }

  const { id } = await params;

  if (!id || id === "undefined") {
    return NextResponse.json({ error: "投稿IDが指定されていません。" }, { status: 400 });
  }

  const { data: post, error } = await auth.serviceClient
    .from("posts")
    .select("id, email, admin_reply, allow_public")
    .eq("id", id)
    .maybeSingle<NotifyPost>();

  if (error) {
    return NextResponse.json({ error: "投稿を取得できませんでした。" }, { status: 500 });
  }

  if (!post) {
    return NextResponse.json({ error: "投稿が見つかりません。" }, { status: 404 });
  }

  if (!post.email) {
    return NextResponse.json({ error: "通知先メールアドレスがありません。" }, { status: 400 });
  }

  if (!post.admin_reply?.trim()) {
    return NextResponse.json({ error: "管理者返信を保存してから通知してください。" }, { status: 400 });
  }

  const siteUrl = process.env.APP_BASE_URL;

  if (!siteUrl) {
    return NextResponse.json({
      ok: true,
      sent: false,
      mocked: true,
      message: "APP_BASE_URL が未設定のため、メールは実送信していません。"
    });
  }

  // TODO: 非公開投稿の本人限定返信確認URLを追加したら、allow_public=false の通知先をそのURLへ差し替える。
  const replyUrl = post.allow_public ? `${siteUrl}/archive/${post.id}` : siteUrl;
  const result = await sendReplyNotificationEmail({
    to: post.email,
    replyUrl
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  if (result.sent) {
    const notifiedAt = new Date().toISOString();
    await auth.serviceClient.from("posts").update({ reply_notified_at: notifiedAt }).eq("id", id);

    return NextResponse.json({
      ok: true,
      sent: true,
      mocked: false,
      replyNotifiedAt: notifiedAt
    });
  }

  return NextResponse.json({
    ok: true,
    sent: false,
    mocked: true,
    message: result.reason
  });
}
