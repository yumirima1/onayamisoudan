"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TagFilter({ categories, basePath = "/archive" }: { categories: string[]; basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") ?? "";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => router.push(basePath)}
        className={`rounded-full border px-3 py-1.5 text-sm transition ${
          current === "" ? "border-night-accent bg-night-accent text-night-background" : "border-night-line bg-night-paper text-night-muted hover:bg-white/[0.06]"
        }`}
      >
        すべて
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => router.push(`${basePath}?category=${encodeURIComponent(category)}`)}
          className={`rounded-full border px-3 py-1.5 text-sm transition ${
            current === category ? "border-night-accent bg-night-accent text-night-background" : "border-night-line bg-night-paper text-night-muted hover:bg-white/[0.06]"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
