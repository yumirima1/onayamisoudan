"use client";

import Link from "next/link";
import type { Post } from "@/lib/types";

export function AdminPostTable({ posts }: { posts: Post[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-night-card">
      <table className="w-full min-w-[760px] text-left text-sm">
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
              <td className="px-4 py-3">{post.urgency}</td>
              <td className="px-4 py-3 text-night-muted">{post.category}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/posts/${post.id}`} className="font-medium text-night-text hover:text-night-accent">
                  {post.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-night-muted">
                {post.allow_public ? "公開 " : ""}
                {post.allow_stream ? "配信" : ""}
              </td>
              <td className="px-4 py-3 text-night-muted">{post.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
