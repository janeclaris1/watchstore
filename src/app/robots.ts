import { MetadataRoute } from "next";

function siteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://cosyaura.us";
  return raw.replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/"],
      },
      {
        // Explicit allow so Algolia Crawler is never treated as blocked
        userAgent: "Algolia Crawler",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Algolia",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
