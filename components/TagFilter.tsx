"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TagFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") ?? "";

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => router.push("/public")} className={`rounded-full px-3 py-1.5 text-sm ${current === "" ? "bg-night-accent text-white" : "bg-white/10 text-night-muted"}`}>
        すべて
      </button>
      {categories.map((category) => (
        <button key={category} onClick={() => router.push(`/public?category=${encodeURIComponent(category)}`)} className={`rounded-full px-3 py-1.5 text-sm ${current === category ? "bg-night-accent text-white" : "bg-white/10 text-night-muted"}`}>
          {category}
        </button>
      ))}
    </div>
  );
}
