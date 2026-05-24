"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminReplyEditor } from "@/components/AdminReplyEditor";
import { adminJsonFetch, verifyAdminSession } from "@/lib/adminSessionClient";
import type { Post, PublicPost } from "@/lib/types";

export default function AdminPostDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const id = typeof params.id === "string" ? params.id : null;
  const [post, setPost] = useState<Post | null>(null);
  const [publicPost, setPublicPost] = useState<PublicPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMessage("");

      try {
        if (!id) {
          setErrorMessage("投稿IDを取得できませんでした。");
          return;
        }

        const adminSession = await verifyAdminSession();

        if (!adminSession.ok) {
          router.push("/admin/login");
          return;
        }

        const data = await adminJsonFetch<{ post: Post; publicPost: PublicPost | null }>(`/api/admin/posts/${id}`);
        setPost(data.post);
        setPublicPost(data.publicPost);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "投稿を取得できませんでした。");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-night-muted sm:px-5 sm:py-12">読み込み中...</div>;
  }

  if (!post) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-night-muted sm:px-5 sm:py-12">{errorMessage || "投稿が見つかりません。"}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
      <div className="break-words rounded-lg border border-red-300/20 bg-red-950/10 p-4 text-sm leading-7 text-red-100">
        原文を扱っています。本文を外部ログ、チャット、公開ページにそのまま貼らないでください。
      </div>
      <section className="mt-6 min-w-0 overflow-hidden rounded-lg border border-white/10 bg-night-card p-4 sm:p-6">
        <div className="flex min-w-0 flex-wrap gap-2 text-sm leading-6 text-night-muted">
          <span className="break-words">{new Date(post.created_at).toLocaleString("ja-JP")}</span>
          <span className="break-words">{post.category}</span>
          <span className="break-words">{post.urgency}</span>
          {post.nickname ? <span className="break-all">nickname: {post.nickname}</span> : null}
          {post.age_group ? <span className="break-words">{post.age_group}</span> : null}
        </div>
        <div className="mt-4 min-w-0 overflow-hidden rounded-md border border-white/10 bg-black/10 p-4 text-sm leading-7 text-night-muted">
          <p className="font-semibold text-night-text">返信通知メール</p>
          {post.email ? (
            <>
              <p className="break-all">{post.email}</p>
              <p>{post.reply_url_sent_at ?? post.reply_notified_at ? `通知済み: ${new Date(post.reply_url_sent_at ?? post.reply_notified_at ?? "").toLocaleString("ja-JP")}` : "まだ通知していません。"}</p>
            </>
          ) : (
            <p>メールアドレスは未入力です。</p>
          )}
        </div>
        <h1 className="mt-4 break-words text-2xl font-semibold leading-tight text-night-text">{post.title}</h1>
        <p className="mt-5 whitespace-pre-wrap break-words leading-8 text-night-muted">{post.body}</p>
      </section>
      <div className="mt-6">
        <AdminReplyEditor post={post} publicPost={publicPost} onPostUpdated={(patch) => setPost((current) => (current ? { ...current, ...patch } : current))} />
      </div>
    </div>
  );
}
