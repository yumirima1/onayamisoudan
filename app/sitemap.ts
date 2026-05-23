import type { MetadataRoute } from "next";
import { createServerSupabase } from "@/lib/supabaseServer";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const now = new Date();
  const staticRoutes = ["", "/submit", "/public", "/about", "/guideline", "/privacy", "/terms"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now
  }));

  try {
    const supabase = createServerSupabase();
    const { data } = await supabase
      .from("public_posts")
      .select("id, updated_at, published_at")
      .eq("archive_status", "published");

    const publicRoutes = (data ?? []).map((post) => ({
      url: `${baseUrl}/public/${post.id}`,
      lastModified: new Date(post.updated_at ?? post.published_at ?? now)
    }));

    return [...staticRoutes, ...publicRoutes];
  } catch {
    return staticRoutes;
  }
}
