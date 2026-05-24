import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { hashReplyToken } from "@/lib/replyToken";
import { createServiceSupabase } from "@/lib/supabaseServer";

type ReplyPost = {
  created_at: string;
  body: string;
  admin_reply: string | null;
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
    .select("created_at, body, admin_reply")
    .eq("reply_token_hash", hashReplyToken(token))
    .maybeSingle<ReplyPost>();

  if (!data) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <header className="space-y-4">
        <p className="text-sm leading-7 text-night-muted">このURLを知っている本人だけ確認できます。他の人には共有しないでください。</p>
        <h1 className="text-2xl font-semibold leading-tight text-night-text sm:text-3xl">返信確認</h1>
      </header>

      <div className="mt-6 rounded-lg border border-white/10 bg-night-card p-4 text-sm leading-7 text-night-muted">
        この場所は医療・診断・治療ではありません。今すぐ危ない場合は、身近な人・学校・地域の相談窓口・緊急窓口に頼ってください。
      </div>

      <section className="mt-8">
        <p className="text-sm text-night-muted">投稿日: {new Date(data.created_at).toLocaleString("ja-JP")}</p>
        <h2 className="mt-5 text-lg font-semibold text-night-text">投稿本文</h2>
        <div className="mt-4 rounded-lg border border-white/10 bg-night-card p-5 sm:p-6">
          <p className="whitespace-pre-wrap text-base leading-9 text-night-muted">{data.body}</p>
        </div>
      </section>

      <div className="my-8 border-t border-white/10" />

      <section>
        <h2 className="text-lg font-semibold text-night-text">管理者返信</h2>
        {data.admin_reply ? (
          <div className="mt-4 rounded-lg border border-white/10 bg-night-card p-5 sm:p-6">
            <p className="whitespace-pre-wrap text-base leading-9 text-night-muted">{data.admin_reply}</p>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-white/10 bg-night-card p-5 sm:p-6">
            <p className="leading-8 text-night-muted">まだ返信はありません。返信には時間がかかることがあります。</p>
          </div>
        )}
      </section>
    </article>
  );
}
