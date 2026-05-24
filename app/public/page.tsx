import { Suspense } from "react";
import type { Metadata } from "next";
import { PublicPostCard } from "@/components/PublicPostCard";
import { TagFilter } from "@/components/TagFilter";
import { createServerSupabase } from "@/lib/supabaseServer";
import type { PublicPost } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "公開アーカイブ",
  description: "投稿者が公開を希望し、管理者が確認した匿名相談を読めるアーカイブです。",
  alternates: {
    canonical: "/public"
  }
};

export default async function PublicArchivePage({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = createServerSupabase();
  let query = supabase
    .from("public_posts")
    .select("id, source_post_id, published_at, public_title, public_body, public_reply, category, archive_status, is_stream_used, stream_url")
    .eq("archive_status", "published")
    .order("published_at", { ascending: false });

  if (searchParams.category) {
    query = query.eq("category", searchParams.category);
  }

  const { data } = await query;
  const posts = (data ?? []) as PublicPost[];
  const categories = Array.from(new Set(posts.map((post) => post.category)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-3xl font-semibold text-night-text">公開アーカイブ</h1>
          <p className="mt-3 max-w-2xl break-words leading-8 text-night-muted">
            掲載されているのは、投稿者が公開を希望し、管理者が確認した公開用データです。
          </p>
        </div>
        <Suspense fallback={null}>
          <TagFilter categories={categories} basePath="/public" />
        </Suspense>
      </div>
      <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <PublicPostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.length === 0 ? <p className="mt-10 break-words text-night-muted">公開中の手紙はまだありません。</p> : null}
    </div>
  );
}
