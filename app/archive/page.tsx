import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { TagFilter } from "@/components/TagFilter";
import { createServerSupabase } from "@/lib/supabaseServer";
import type { ArchivePost } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "公開アーカイブ",
  description: "公開許可された匿名相談を読めるアーカイブです。"
};

function excerpt(body: string) {
  return body.length > 120 ? `${body.slice(0, 120)}...` : body;
}

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const supabase = createServerSupabase();
  let query = supabase
    .from("archive_posts_view")
    .select("id, created_at, updated_at, category, title, body, admin_reply, replied_at")
    .order("created_at", { ascending: false });

  if (params.category) {
    query = query.eq("category", params.category);
  }

  const { data, error } = await query;
  const posts = (data ?? []) as ArchivePost[];
  const categories = Array.from(new Set(posts.map((post) => post.category)));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-night-text">公開アーカイブ</h1>
          <p className="mt-3 max-w-2xl leading-8 text-night-muted">
            投稿者が公開を許可した相談だけを掲載しています。メールアドレスや管理用メモは公開されません。
          </p>
        </div>
        <Suspense fallback={null}>
          <TagFilter categories={categories} />
        </Suspense>
      </div>

      {error ? <p className="mt-8 rounded-md border border-red-300/30 bg-red-950/20 p-4 text-sm text-red-100">公開アーカイブを読み込めませんでした。</p> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.id} className="rounded-lg border border-white/10 bg-night-card p-5 transition hover:border-night-accent/60">
            <div className="flex flex-wrap items-center gap-2 text-xs text-night-muted">
              <span>{post.category}</span>
              <span>{new Date(post.created_at).toLocaleDateString("ja-JP")}</span>
              <span>{post.admin_reply ? "返信あり" : "返信待ち"}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-night-text">
              <Link href={`/archive/${post.id}`}>{post.title}</Link>
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-night-muted">{excerpt(post.body)}</p>
          </article>
        ))}
      </div>

      {!error && posts.length === 0 ? <p className="mt-10 text-night-muted">公開中の投稿はまだありません。</p> : null}
    </div>
  );
}
