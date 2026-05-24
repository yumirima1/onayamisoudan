"use client";

import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminPostTable } from "@/components/AdminPostTable";
import { adminJsonFetch, verifyAdminSession } from "@/lib/adminSessionClient";
import { urgencyLabel } from "@/lib/displayLabels";
import type { Post } from "@/lib/types";

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-night-muted sm:px-5 sm:py-12">読み込み中...</div>}>
      <AdminPostsContent />
    </Suspense>
  );
}

function AdminPostsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "all";
  const urgencyFilter = searchParams.get("urgency") ?? "all";
  const categoryFilter = searchParams.get("category") ?? "all";
  const allowPublicFilter = searchParams.get("allow_public") ?? "all";
  const allowStreamFilter = searchParams.get("allow_stream") ?? "all";
  const search = searchParams.get("q")?.trim() ?? "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const adminSession = await verifyAdminSession();

      if (!adminSession.ok) {
        router.push("/admin/login");
        return;
      }

      const data = await adminJsonFetch<{ posts: Post[] }>("/api/admin/posts");
      setPosts(data.posts);
      setLoading(false);
    }

    load();
  }, [router]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (statusFilter !== "all" && post.status !== statusFilter) return false;
      if (urgencyFilter !== "all" && post.urgency !== urgencyFilter) return false;
      if (categoryFilter !== "all" && post.category !== categoryFilter) return false;
      if (allowPublicFilter !== "all" && String(post.allow_public) !== allowPublicFilter) return false;
      if (allowStreamFilter !== "all" && String(post.allow_stream) !== allowStreamFilter) return false;
      if (search && !`${post.title} ${post.category}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allowPublicFilter, allowStreamFilter, categoryFilter, posts, search, statusFilter, urgencyFilter]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/admin/posts${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
      <h1 className="break-words text-3xl font-semibold text-night-text">投稿一覧</h1>
      <div className="mt-5 grid min-w-0 gap-3 rounded-lg border border-night-line bg-night-card p-4 text-sm md:grid-cols-3">
        <select value={statusFilter} onChange={(event) => setParam("status", event.target.value)} className="min-w-0 rounded-md border border-white/10 bg-black/20 px-3 py-3 text-base outline-none focus:border-night-accent md:text-sm">
          <option value="all">状態すべて</option>
          <option value="unreplied">未返信</option>
          <option value="replied">返信済み</option>
          <option value="hidden">非表示</option>
        </select>
        <select value={urgencyFilter} onChange={(event) => setParam("urgency", event.target.value)} className="min-w-0 rounded-md border border-white/10 bg-black/20 px-3 py-3 text-base outline-none focus:border-night-accent md:text-sm">
          <option value="all">緊急度すべて</option>
          <option value="normal">{urgencyLabel("normal")}</option>
          <option value="soon">{urgencyLabel("soon")}</option>
          <option value="risky">{urgencyLabel("risky")}</option>
        </select>
        <select value={categoryFilter} onChange={(event) => setParam("category", event.target.value)} className="min-w-0 rounded-md border border-white/10 bg-black/20 px-3 py-3 text-base outline-none focus:border-night-accent md:text-sm">
          <option value="all">カテゴリすべて</option>
          {["学校", "人間関係", "家族", "恋愛", "将来", "気分", "ただ聞いてほしい", "その他"].map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select value={allowPublicFilter} onChange={(event) => setParam("allow_public", event.target.value)} className="min-w-0 rounded-md border border-white/10 bg-black/20 px-3 py-3 text-base outline-none focus:border-night-accent md:text-sm">
          <option value="all">公開希望すべて</option>
          <option value="true">公開希望あり</option>
          <option value="false">公開希望なし</option>
        </select>
        <select value={allowStreamFilter} onChange={(event) => setParam("allow_stream", event.target.value)} className="min-w-0 rounded-md border border-white/10 bg-black/20 px-3 py-3 text-base outline-none focus:border-night-accent md:text-sm">
          <option value="all">配信希望すべて</option>
          <option value="true">配信希望あり</option>
          <option value="false">配信希望なし</option>
        </select>
        <input defaultValue={search} onBlur={(event) => setParam("q", event.target.value)} placeholder="タイトル検索" className="min-w-0 rounded-md border border-white/10 bg-black/20 px-3 py-3 text-base outline-none focus:border-night-accent md:text-sm" />
      </div>
      <div className="mt-8 min-w-0">{loading ? <p className="text-night-muted">読み込み中...</p> : <AdminPostTable posts={filteredPosts} />}</div>
    </div>
  );
}
