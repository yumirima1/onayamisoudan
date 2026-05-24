"use client";

import Link from "next/link";
import { postStatusLabel, publicWishLabel, urgencyLabel } from "@/lib/displayLabels";
import type { Post } from "@/lib/types";

export function AdminPostTable({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-night-line bg-night-card p-4 text-sm leading-7 text-night-muted">
        条件に合う投稿はありません。
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="grid gap-3 md:hidden">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/admin/posts/${post.id}`}
            className="min-w-0 overflow-hidden rounded-lg border border-night-line bg-night-card p-4 transition hover:border-night-accent/60"
          >
            <div className="flex flex-wrap gap-2 text-xs leading-6 text-night-muted">
              <span>{new Date(post.created_at).toLocaleString("ja-JP")}</span>
              <span>{post.category}</span>
              <span>{urgencyLabel(post.urgency)}</span>
              <span>{postStatusLabel(post.status)}</span>
            </div>
            <h2 className="mt-3 break-words text-base font-semibold leading-7 text-night-text">{post.title}</h2>
            <p className="mt-3 text-xs leading-6 text-night-muted">
              {publicWishLabel(post.allow_public)} / {post.allow_stream ? "配信希望あり" : "配信希望なし"}
            </p>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-night-line bg-night-card md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-night-muted">
          <tr>
            <th className="px-4 py-3">日時</th>
            <th className="px-4 py-3">緊急度</th>
            <th className="px-4 py-3">カテゴリ</th>
            <th className="px-4 py-3">タイトル</th>
            <th className="px-4 py-3">許可</th>
            <th className="px-4 py-3">状態</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-white/[0.03]">
              <td className="px-4 py-3 text-night-muted">{new Date(post.created_at).toLocaleString("ja-JP")}</td>
              <td className="px-4 py-3">{urgencyLabel(post.urgency)}</td>
              <td className="px-4 py-3 text-night-muted">{post.category}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/posts/${post.id}`} className="break-words font-medium text-night-text hover:text-night-accent">
                  {post.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-night-muted">
                {post.allow_public ? "公開希望 " : ""}
                {post.allow_stream ? "配信希望" : ""}
              </td>
              <td className="px-4 py-3 text-night-muted">{postStatusLabel(post.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
