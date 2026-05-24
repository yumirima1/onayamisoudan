"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJsonFetch, verifyAdminSession } from "@/lib/adminSessionClient";
import type { PublicPost } from "@/lib/types";

export default function AdminStreamPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const adminSession = await verifyAdminSession();

      if (!adminSession.ok) {
        router.push("/admin/login");
        return;
      }

      const data = await adminJsonFetch<{ posts: PublicPost[] }>("/api/admin/public-posts?archive_status=published");
      setPosts(data.posts);
      setLoading(false);
    }

    load();
  }, [router]);

  async function saveStream(post: PublicPost, formData: FormData) {
    const streamUrl = String(formData.get("stream_url") ?? "").trim();
    const isStreamUsed = formData.get("is_stream_used") === "on";
    try {
      await adminJsonFetch<{ ok: boolean }>(`/api/admin/public-posts/${post.id}/stream`, {
        method: "PATCH",
        body: JSON.stringify({
          streamUrl,
          isStreamUsed
        })
      });
    } catch {
      setMessage("配信情報を保存できませんでした。");
      return;
    }

    setMessage("配信情報を保存しました。");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
      <h1 className="break-words text-3xl font-semibold text-night-text">配信管理</h1>
      <p className="mt-3 break-words leading-7 text-night-muted">配信候補化された公開用データだけを扱います。</p>
      {message ? <p className="mt-4 break-words text-sm leading-7 text-night-muted">{message}</p> : null}
      {loading ? <p className="mt-8 text-night-muted">読み込み中...</p> : null}
      <div className="mt-8 grid gap-4">
        {posts.map((post) => (
          <article key={post.id} className="min-w-0 overflow-hidden rounded-lg border border-white/10 bg-night-card p-4 sm:p-5">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="break-words text-lg font-semibold">{post.public_title}</h2>
              {post.source_post_id ? (
                <Link href={`/admin/posts/${post.source_post_id}`} className="rounded-md border border-white/15 px-3 py-2 text-center text-sm text-night-muted hover:bg-white/10">
                  原投稿へ
                </Link>
              ) : null}
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-night-muted">{post.public_body}</p>
            <form action={(formData) => saveStream(post, formData)} className="mt-4 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(12rem,18rem)_auto]">
              <label className="space-y-2 text-sm text-night-muted">
                <span>配信用要約欄</span>
                <textarea readOnly value={post.public_body} rows={3} className="w-full min-w-0 rounded-md border border-white/10 bg-black/20 p-3 text-base leading-7 md:text-sm" />
              </label>
              <label className="space-y-2 text-sm text-night-muted">
                <span>配信URL</span>
                <input name="stream_url" defaultValue={post.stream_url ?? ""} className="w-full min-w-0 rounded-md border border-white/10 bg-black/20 p-3 text-base md:text-sm" />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex min-w-0 gap-2 pb-1 text-sm text-night-muted sm:pb-3">
                  <input name="is_stream_used" type="checkbox" defaultChecked={post.is_stream_used} />
                  <span className="break-words">使用済み</span>
                </label>
                <button className="rounded-md bg-night-accent px-4 py-3 text-sm font-semibold text-night-background">保存</button>
              </div>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
