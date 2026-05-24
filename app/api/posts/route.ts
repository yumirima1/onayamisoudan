import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";
import { createReplyToken, hashReplyToken } from "@/lib/replyToken";
import { submitPostSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const rateKey = forwardedFor || request.headers.get("x-real-ip") || "anonymous";
  const rate = checkRateLimit(`submit:${rateKey}`, 1, 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const parsed = submitPostSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const replyToken = createReplyToken();
  const { error } = await supabase.from("posts").insert({
    ...parsed.data,
    reply_token_hash: hashReplyToken(replyToken)
  });

  if (error) {
    return NextResponse.json({ error: "Could not submit post." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
