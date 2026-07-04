import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/projects", "/search", "/chat", "/library", "/bibliography", "/uploads", "/settings", "/usage"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
