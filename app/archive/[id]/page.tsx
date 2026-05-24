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
    return { title: "公開投稿 | よるの相談箱" };
  }

  return {
    title: `${data.title} | よるの相談箱`,
    description: String(data.body).slice(0, 120),
    openGraph: {
      title: `${data.title} | よるの相談箱`,
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
    .select("id, created_at, updated_at, category, title, body, admin_reply, replied_at")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const post = data as ArchivePost;

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <div className="rounded-lg border border-white/10 bg-night-card p-4 text-sm leading-7 text-night-muted">
        この場所は医療・診断・治療ではありません。今すぐ危ない場合は、身近な人・学校・地域の相談窓口・緊急窓口に頼ってください。
      </div>

      <div className="mt-8 flex flex-wrap gap-2 text-sm text-night-muted">
        <span>{post.category}</span>
        <span>{new Date(post.created_at).toLocaleDateString("ja-JP")}</span>
      </div>
      <h1 className="mt-4 text-3xl font-semibold leading-tight text-night-text">{post.title}</h1>

      <section className="mt-8 rounded-lg border border-white/10 bg-night-card p-6">
        <h2 className="font-semibold text-night-text">投稿</h2>
        <p className="mt-4 whitespace-pre-wrap leading-8 text-night-muted">{post.body}</p>
      </section>

      <section className="mt-6 rounded-lg border border-white/10 bg-night-card p-6">
        <h2 className="font-semibold text-night-text">返信</h2>
        {post.admin_reply ? (
          <p className="mt-4 whitespace-pre-wrap leading-8 text-night-muted">{post.admin_reply}</p>
        ) : (
          <p className="mt-4 leading-8 text-night-muted">まだ返信はありません。返信には時間がかかることがあります。</p>
        )}
      </section>
    </article>
  );
}
