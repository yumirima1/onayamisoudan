import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { hashReplyToken } from "@/lib/replyToken";
import { createServiceSupabase } from "@/lib/supabaseServer";

type ReplyPost = {
  title: string;
  category: string;
  body: string;
  admin_reply: string | null;
  replied_at: string | null;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "返信確認 | よるの相談箱",
  description: "投稿者本人向けの返信確認ページです。"
};

function isValidToken(token: string) {
  return /^[A-Za-z0-9_-]{32,}$/.test(token);
}

export default async function ReplyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!isValidToken(token)) {
    notFound();
  }

  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("posts")
    .select("title, category, body, admin_reply, replied_at")
    .eq("reply_token_hash", hashReplyToken(token))
    .maybeSingle<ReplyPost>();

  if (!data) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <div className="rounded-lg border border-white/10 bg-night-card p-4 text-sm leading-7 text-night-muted">
        この場所は医療・診断・治療ではありません。今すぐ危ない場合は、身近な人・学校・地域の相談窓口・緊急窓口に頼ってください。
      </div>

      <div className="mt-8 flex flex-wrap gap-2 text-sm text-night-muted">
        <span>{data.category}</span>
        {data.replied_at ? <span>返信日: {new Date(data.replied_at).toLocaleDateString("ja-JP")}</span> : null}
      </div>
      <h1 className="mt-4 text-3xl font-semibold leading-tight text-night-text">{data.title}</h1>

      <section className="mt-8 rounded-lg border border-white/10 bg-night-card p-6">
        <h2 className="font-semibold text-night-text">投稿</h2>
        <p className="mt-4 whitespace-pre-wrap leading-8 text-night-muted">{data.body}</p>
      </section>

      <section className="mt-6 rounded-lg border border-white/10 bg-night-card p-6">
        <h2 className="font-semibold text-night-text">返信</h2>
        {data.admin_reply ? (
          <p className="mt-4 whitespace-pre-wrap leading-8 text-night-muted">{data.admin_reply}</p>
        ) : (
          <p className="mt-4 leading-8 text-night-muted">まだ返信はありません。</p>
        )}
      </section>
    </article>
  );
}
