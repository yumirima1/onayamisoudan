import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabaseServer";
import type { ArchivePost } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data } = await supabase.from("archive_posts_view").select("title, body").eq("id", id).maybeSingle();

  if (!data) {
    return { title: "公開アーカイブ" };
  }

  return {
    title: String(data.title),
    description: String(data.body).slice(0, 120),
    alternates: {
      canonical: `/archive/${id}`
    },
    openGraph: {
      title: String(data.title),
      description: String(data.body).slice(0, 120),
      type: "article"
    }
  };
}

export default async function ArchivePostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("archive_posts_view")
    .select("created_at, category, title, body, admin_reply")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const post = data as ArchivePost;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-5 sm:py-14">
      <div className="rounded-lg border border-night-line bg-night-paper/75 p-4 text-sm leading-7 text-night-muted">
        この場所は医療・診断・治療ではありません。今すぐ危ない場合は、身近な人・学校・地域の相談窓口・緊急窓口に頼ってください。
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-night-muted">
        <span className="max-w-full break-words rounded-full border border-night-line bg-night-paper px-3 py-1 text-xs">{post.category}</span>
        <span>{new Date(post.created_at).toLocaleDateString("ja-JP")}</span>
      </div>
      <h1 className="mt-4 break-words text-3xl font-semibold leading-tight text-night-text sm:text-4xl">{post.title}</h1>

      <section className="mt-8 min-w-0 overflow-hidden rounded-lg border border-night-line bg-night-card p-4 sm:p-7">
        <h2 className="text-sm font-semibold tracking-[0.08em] text-night-warm">投稿本文</h2>
        <p className="mt-5 whitespace-pre-wrap break-words text-base leading-9 text-night-muted">{post.body}</p>
      </section>

      <section className="mt-6 min-w-0 overflow-hidden rounded-lg border border-night-line bg-night-card p-4 sm:p-7">
        <h2 className="text-sm font-semibold tracking-[0.08em] text-night-warm">管理者返信</h2>
        {post.admin_reply ? (
          <p className="mt-5 whitespace-pre-wrap break-words text-base leading-9 text-night-muted">{post.admin_reply}</p>
        ) : (
          <p className="mt-5 leading-8 text-night-muted">まだ返信はありません。返信には時間がかかることがあります。</p>
        )}
      </section>
    </article>
  );
}
