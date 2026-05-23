import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabaseServer";
import type { PublicPost } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("public_posts")
    .select("public_title, public_body")
    .eq("id", id)
    .eq("archive_status", "published")
    .single();

  if (!data) {
    return { title: "公開投稿 | よるの相談箱" };
  }

  return {
    title: `${data.public_title} | よるの相談箱`,
    description: String(data.public_body).slice(0, 120),
    openGraph: {
      title: `${data.public_title} | よるの相談箱`,
      description: String(data.public_body).slice(0, 120),
      type: "article"
    }
  };
}

export default async function PublicPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("public_posts")
    .select("id, source_post_id, published_at, public_title, public_body, public_reply, category, archive_status, is_stream_used, stream_url")
    .eq("id", id)
    .eq("archive_status", "published")
    .single();

  if (!data) {
    notFound();
  }

  const post = data as PublicPost;

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex flex-wrap gap-2 text-sm text-night-muted">
        <span>{post.category}</span>
      </div>
      <h1 className="mt-4 text-3xl font-semibold leading-tight text-night-text">{post.public_title}</h1>
      <section className="mt-8 rounded-lg border border-white/10 bg-night-card p-6">
        <h2 className="font-semibold text-night-text">投稿</h2>
        <p className="mt-4 whitespace-pre-wrap leading-8 text-night-muted">{post.public_body}</p>
      </section>
      <section className="mt-6 rounded-lg border border-white/10 bg-night-card p-6">
        <h2 className="font-semibold text-night-text">返信</h2>
        <p className="mt-4 whitespace-pre-wrap leading-8 text-night-muted">{post.public_reply}</p>
      </section>
    </article>
  );
}
