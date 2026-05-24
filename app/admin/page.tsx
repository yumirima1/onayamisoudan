"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJsonFetch, logoutAdminSession, verifyAdminSession } from "@/lib/adminSessionClient";
import { urgencyLabel } from "@/lib/displayLabels";
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

      setDiagnostic("管理ログイン確認済み。管理データはサーバーAPI経由で取得しています。");
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
    { label: "早めの確認が必要", value: posts.filter((post) => post.urgency === "risky" || post.urgency === "soon").length, href: "/admin/posts?urgency=risky" },
    { label: "公開希望あり", value: posts.filter((post) => post.allow_public).length, href: "/admin/posts?allow_public=true" },
    { label: "配信許可あり", value: posts.filter((post) => post.allow_stream).length, href: "/admin/posts?allow_stream=true" }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-3xl font-semibold text-night-text">管理ダッシュボード</h1>
          <p className="mt-3 break-words leading-7 text-night-muted">原文を扱う画面です。画面共有やログ出力に注意してください。</p>
        </div>
        <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
          <Link href="/admin/posts" className="rounded-md border border-white/15 px-4 py-2.5 text-center text-sm hover:bg-white/10">
            投稿一覧
          </Link>
          <Link href="/admin/stream" className="rounded-md border border-white/15 px-4 py-2.5 text-center text-sm hover:bg-white/10">
            配信管理
          </Link>
          <button onClick={handleLogout} className="rounded-md border border-white/15 px-4 py-2.5 text-sm hover:bg-white/10">
            ログアウト
          </button>
        </div>
      </div>
      {loading ? <p className="mt-8 text-night-muted">読み込み中...</p> : null}
      {diagnostic ? (
        <div className="mt-6 whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-night-card p-4 text-sm leading-7 text-night-muted">
          {diagnostic}
        </div>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="min-w-0 rounded-lg border border-white/10 bg-night-card p-4 hover:border-night-accent/60 sm:p-5">
            <p className="break-words text-sm text-night-muted">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-night-text">{card.value}</p>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-xs leading-6 text-night-muted">
        緊急度の表示例: {urgencyLabel("normal")} / {urgencyLabel("soon")} / {urgencyLabel("risky")}
      </p>
    </div>
  );
}
