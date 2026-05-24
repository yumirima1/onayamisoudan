import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/submit", "/archive", "/about", "/guideline", "/privacy", "/terms"],
        disallow: ["/admin", "/admin/"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
