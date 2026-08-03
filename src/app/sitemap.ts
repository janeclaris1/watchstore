import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

function siteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://cosyaura.us";
  return raw.replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl();

  const staticPages = [
    "/about",
    "/blog",
    "/careers",
    "/press",
    "/sustainability",
    "/faq",
    "/shipping",
    "/returns",
    "/contact",
    "/privacy",
  ];

  try {
    const [watches, brands, posts] = await Promise.all([
      prisma.watch.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.brand.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/watches`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      ...staticPages.map((path) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
      ...brands.map((b) => ({
        url: `${baseUrl}/watches/${b.slug}`,
        lastModified: b.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
      ...watches.map((w) => ({
        url: `${baseUrl}/watches/${w.slug}`,
        lastModified: w.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...posts.map((p) => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/watches`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      ...staticPages.map((path) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  }
}
