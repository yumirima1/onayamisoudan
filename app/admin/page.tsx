"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJsonFetch, logoutAdminSession, verifyAdminSession } from "@/lib/adminSessionClient";
import type { Post } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [diagnostic, setDiagnostic] = useState("");

  useEffect(() => {
    async function load() {
      const adminSession = await verifyAdminSession();

      if (!adminSession.ok) {
        router.push("/admin/login");
        return;
      }

      setDiagnostic("簡易管理ログイン確認済み。管理データはサーバーAPI経由で取得しています。");
      const data = await adminJsonFetch<{ posts: Post[] }>("/api/admin/posts?limit=50");
      setPosts(data.posts);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleLogout() {
    await logoutAdminSession();
    router.push("/admin/login");
    router.refresh();
  }

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
          <button onClick={handleLogout} className="rounded-md border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
            ログアウト
          </button>
        </div>
      </div>
      {loading ? <p className="mt-8 text-night-muted">読み込み中...</p> : null}
      {diagnostic ? (
        <div className="mt-6 whitespace-pre-wrap rounded-lg border border-white/10 bg-night-card p-4 text-sm leading-7 text-night-muted">
          {diagnostic}
        </div>
      ) : null}
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
