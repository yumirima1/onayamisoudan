"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Post } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/login");
        return;
      }

      const { data } = await supabase
        .from("posts")
        .select("id, created_at, nickname, age_group, category, title, body, urgency, allow_public, allow_stream, admin_reply, admin_memo, public_draft_title, public_draft_body, public_draft_reply, risk_flags, ai_summary, ai_drafts, status, replied_at")
        .order("created_at", { ascending: false })
        .limit(50);

      setPosts((data ?? []) as Post[]);
      setLoading(false);
    }

    load();
  }, [router]);

  const cards = [
    { label: "未返信", value: posts.filter((post) => post.status === "unreplied").length, href: "/admin/posts?status=unreplied" },
    { label: "緊急度高め", value: posts.filter((post) => post.urgency === "risky" || post.urgency === "soon").length, href: "/admin/posts?urgency=risky" },
    { label: "公開許可あり", value: posts.filter((post) => post.allow_public).length, href: "/admin/posts?allow_public=true" },
    { label: "配信許可あり", value: posts.filter((post) => post.allow_stream).length, href: "/admin/posts?allow_stream=true" }
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-night-text">管理ダッシュボード</h1>
          <p className="mt-3 text-night-muted">原文を扱う画面です。画面共有やログ出力に注意してください。</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/posts" className="rounded-md border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
            投稿一覧
          </Link>
          <Link href="/admin/stream" className="rounded-md border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
            配信管理
          </Link>
        </div>
      </div>
      {loading ? <p className="mt-8 text-night-muted">読み込み中...</p> : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-lg border border-white/10 bg-night-card p-5 hover:border-night-accent/60">
            <p className="text-sm text-night-muted">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-night-text">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
