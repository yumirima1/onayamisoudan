import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message, code: auth.code }, { status: auth.status });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { adminReply?: unknown; adminMemo?: unknown; currentStatus?: unknown; repliedAt?: unknown } | null;
  const adminReply = typeof body?.adminReply === "string" ? body.adminReply : "";
  const adminMemo = typeof body?.adminMemo === "string" ? body.adminMemo : "";
  const currentStatus = typeof body?.currentStatus === "string" ? body.currentStatus : "unreplied";
  const repliedAt = typeof body?.repliedAt === "string" ? body.repliedAt : null;

  const { error } = await auth.serviceClient
    .from("posts")
    .update({
      admin_reply: adminReply || null,
      admin_memo: adminMemo || null,
      status: adminReply.trim() ? "replied" : currentStatus,
      replied_at: adminReply.trim() ? new Date().toISOString() : repliedAt
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "返信を保存できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
