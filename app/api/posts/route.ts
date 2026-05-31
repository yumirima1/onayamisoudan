import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createServerSupabase } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";
import { createReplyToken, hashReplyToken } from "@/lib/replyToken";
import { submitPostSchema } from "@/lib/validation";
import { notifyDiscordNewPost } from "@/lib/discord";

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  const rateKey = forwardedFor || realIp || vercelIp || "anonymous";
  const shortRate = checkRateLimit(`submit:short:${rateKey}`, 3, 60 * 1000);
  const longRate = checkRateLimit(`submit:long:${rateKey}`, 10, 10 * 60 * 1000);

  if (!shortRate.allowed || !longRate.allowed) {
    return NextResponse.json({ error: "少し時間をおいてから、もう一度送ってください。" }, { status: 429 });
  }

  const parsed = submitPostSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容を確認してください。" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const postId = randomUUID();
  const replyToken = createReplyToken();
  const baseUrl = process.env.APP_BASE_URL ?? request.nextUrl.origin;
  const replyUrl = `${baseUrl.replace(/\/$/, "")}/reply/${replyToken}`;
  const { website, ...postData } = parsed.data;
  const { error } = await supabase.from("posts").insert({
    id: postId,
    ...postData,
    reply_token_hash: hashReplyToken(replyToken)
  });

  if (error) {
    return NextResponse.json({ error: "送信できませんでした。少し時間を置いてもう一度お試しください。" }, { status: 500 });
  }

  const adminUrl = `${baseUrl.replace(/\/$/, "")}/admin/posts/${postId}`;

  try {
    await notifyDiscordNewPost({
      title: postData.title,
      category: postData.category,
      urgency: postData.urgency,
      allowPublic: postData.allow_public,
      adminUrl
    });
  } catch (discordError) {
    console.error("Failed to send Discord new post notification", discordError);
  }

  return NextResponse.json({ ok: true, replyUrl }, { status: 201 });
}
