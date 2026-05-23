"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { verifyAdminSession } from "@/lib/adminSessionClient";
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
        await supabase.auth.signOut();
        router.push("/admin/login");
        return;
      }

      const { data } = await supabase
        .from("public_posts")
        .select("id, source_post_id, published_at, public_title, public_body, public_reply, category, archive_status, is_stream_used, stream_url")
        .eq("archive_status", "published")
        .order("published_at", { ascending: false });

      setPosts((data ?? []) as PublicPost[]);
      setLoading(false);
    }

    load();
  }, [router]);

  async function saveStream(post: PublicPost, formData: FormData) {
    const streamUrl = String(formData.get("stream_url") ?? "").trim();
    const isStreamUsed = formData.get("is_stream_used") === "on";
    const { error } = await supabase
      .from("public_posts")
      .update({
        stream_url: streamUrl || null,
        is_stream_used: isStreamUsed
      })
      .eq("id", post.id);

    if (error) {
      setMessage("配信情報を保存できませんでした。");
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("admin_audit_logs").insert({
        admin_id: user.id,
        action: "update_stream_info",
        target_table: "public_posts",
        target_id: post.id,
        metadata: {}
      });
    }

    setMessage("配信情報を保存しました。");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-semibold text-night-text">配信管理</h1>
      <p className="mt-3 text-night-muted">配信候補化された公開用データだけを扱います。</p>
      {message ? <p className="mt-4 text-sm text-night-muted">{message}</p> : null}
      {loading ? <p className="mt-8 text-night-muted">読み込み中...</p> : null}
      <div className="mt-8 grid gap-4">
        {posts.map((post) => (
          <article key={post.id} className="rounded-lg border border-white/10 bg-night-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{post.public_title}</h2>
              {post.source_post_id ? (
                <Link href={`/admin/posts/${post.source_post_id}`} className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-night-muted hover:bg-white/10">
                  原投稿へ
                </Link>
              ) : null}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-night-muted">{post.public_body}</p>
            <form action={(formData) => saveStream(post, formData)} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <label className="space-y-2 text-sm text-night-muted">
                <span>配信用要約欄</span>
                <textarea readOnly value={post.public_body} rows={3} className="w-full rounded-md border border-white/10 bg-black/20 p-3 leading-7" />
              </label>
              <label className="space-y-2 text-sm text-night-muted">
                <span>配信URL</span>
                <input name="stream_url" defaultValue={post.stream_url ?? ""} className="w-full rounded-md border border-white/10 bg-black/20 p-3" />
              </label>
              <div className="flex items-end gap-3">
                <label className="flex gap-2 pb-3 text-sm text-night-muted">
                  <input name="is_stream_used" type="checkbox" defaultChecked={post.is_stream_used} />
                  使用済み
                </label>
                <button className="rounded-md bg-night-accent px-4 py-3 text-sm font-semibold text-white">保存</button>
              </div>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
