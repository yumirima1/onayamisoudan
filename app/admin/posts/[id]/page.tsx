"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminReplyEditor } from "@/components/AdminReplyEditor";
import { supabase } from "@/lib/supabaseClient";
import { verifyAdminSession } from "@/lib/adminSessionClient";
import type { Post, PublicPost } from "@/lib/types";

export default function AdminPostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [publicPost, setPublicPost] = useState<PublicPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const adminSession = await verifyAdminSession();

      if (!adminSession.ok) {
        await supabase.auth.signOut();
        router.push("/admin/login");
        return;
      }

      const { data: postData } = await supabase
        .from("posts")
        .select("id, created_at, nickname, age_group, category, title, body, urgency, allow_public, allow_stream, admin_reply, admin_memo, public_draft_title, public_draft_body, public_draft_reply, risk_flags, ai_summary, ai_drafts, status, replied_at")
        .eq("id", params.id)
        .single();

      const { data: publicPostData } = await supabase
        .from("public_posts")
        .select("id, source_post_id, published_at, public_title, public_body, public_reply, category, archive_status, is_stream_used, stream_url")
        .eq("source_post_id", params.id)
        .maybeSingle();

      setPost((postData ?? null) as Post | null);
      setPublicPost((publicPostData ?? null) as PublicPost | null);
      setLoading(false);
    }

    load();
  }, [params.id, router]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-5 py-12 text-night-muted">読み込み中...</div>;
  }

  if (!post) {
    return <div className="mx-auto max-w-6xl px-5 py-12 text-night-muted">投稿が見つかりません。</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="rounded-lg border border-red-300/20 bg-red-950/10 p-4 text-sm leading-7 text-red-100">
        原文を扱っています。本文を外部ログ、チャット、公開ページにそのまま貼らないでください。
      </div>
      <section className="mt-6 rounded-lg border border-white/10 bg-night-card p-6">
        <div className="flex flex-wrap gap-2 text-sm text-night-muted">
          <span>{new Date(post.created_at).toLocaleString("ja-JP")}</span>
          <span>{post.category}</span>
          <span>{post.urgency}</span>
          {post.nickname ? <span>nickname: {post.nickname}</span> : null}
          {post.age_group ? <span>{post.age_group}</span> : null}
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-night-text">{post.title}</h1>
        <p className="mt-5 whitespace-pre-wrap leading-8 text-night-muted">{post.body}</p>
      </section>
      <div className="mt-6">
        <AdminReplyEditor post={post} publicPost={publicPost} />
      </div>
    </div>
  );
}
