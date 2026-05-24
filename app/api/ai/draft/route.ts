import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth";
import { generateAdminDraft, isAiEnabled } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET() {
  return NextResponse.json({
    enabled: isAiEnabled(),
    message: isAiEnabled() ? "下書き補助は将来実装用に準備されています。" : "下書き補助は未設定です。"
  });
}

export async function POST(request: NextRequest) {
  if (!isAiEnabled()) {
    return NextResponse.json({ error: "下書き補助は未設定です。" }, { status: 503 });
  }

  const auth = requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message, code: auth.code }, { status: auth.status });
  }

  const rate = checkRateLimit("admin-ai-draft", 8, 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = (await request.json()) as { postId?: string };
  if (!body.postId) {
    return NextResponse.json({ error: "postId is required." }, { status: 400 });
  }

  const { data: post, error } = await auth.serviceClient
    .from("posts")
    .select("id, title, body, category, urgency")
    .eq("id", body.postId)
    .single();

  if (error || !post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  void post;
  try {
    await generateAdminDraft();
  } catch {
    return NextResponse.json({ error: "下書き補助は今後実装予定です。" }, { status: 501 });
  }

  return NextResponse.json({ error: "下書き補助は今後実装予定です。" }, { status: 501 });
}
