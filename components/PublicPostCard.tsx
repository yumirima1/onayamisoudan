import Link from "next/link";
import type { PublicPost } from "@/lib/types";

export function PublicPostCard({ post }: { post: PublicPost }) {
  return (
    <article className="rounded-lg border border-white/10 bg-night-card p-5 transition hover:border-night-accent/60">
      <div className="flex flex-wrap gap-2 text-xs text-night-muted">
        <span>{post.category}</span>
      </div>
      <h2 className="mt-3 text-lg font-semibold text-night-text">
        <Link href={`/public/${post.id}`}>{post.public_title}</Link>
      </h2>
      <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-7 text-night-muted">{post.public_body}</p>
    </article>
  );
}
