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
  return body.length > 110 ? `${body.slice(0, 110)}...` : body;
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
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-[0.08em] text-night-warm">公開された手紙</p>
          <h1 className="mt-3 text-3xl font-semibold text-night-text">公開アーカイブ</h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-night-muted">
            投稿者が公開を許可した相談だけを掲載しています。個人情報や管理用の情報は公開されません。
          </p>
        </div>
        <Suspense fallback={null}>
          <TagFilter categories={categories} />
        </Suspense>
      </div>

      {error ? <p className="mt-8 rounded-lg border border-red-300/30 bg-red-950/20 p-4 text-sm leading-7 text-red-100">公開アーカイブを読み込めませんでした。</p> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/archive/${post.id}`}
            className="block rounded-lg border border-night-line bg-night-card p-5 transition hover:border-night-accent/70 hover:bg-night-paper/70"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs leading-6 text-night-muted">
              <span className="rounded-full border border-night-line bg-night-background/35 px-2.5 py-1">{post.category}</span>
              <span>{new Date(post.created_at).toLocaleDateString("ja-JP")}</span>
              <span>{post.admin_reply ? "返信あり" : "返信待ち"}</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold leading-7 text-night-text">{post.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-night-muted">{excerpt(post.body)}</p>
            <p className="mt-5 text-sm font-medium text-night-warm">読む</p>
          </Link>
        ))}
      </div>

      {!error && posts.length === 0 ? (
        <p className="mt-10 rounded-lg border border-night-line bg-night-card p-5 text-sm leading-7 text-night-muted">公開中の投稿はまだありません。</p>
      ) : null}
    </div>
  );
}
