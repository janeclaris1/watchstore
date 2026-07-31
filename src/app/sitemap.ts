import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const [watches, brands] = await Promise.all([
      prisma.watch.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.brand.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const staticPages = [
      "/about",
      "/careers",
      "/press",
      "/sustainability",
      "/faq",
      "/shipping",
      "/returns",
      "/contact",
      "/wishlist",
      "/cart",
    ];

    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      { url: `${baseUrl}/watches`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
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
    ];
  } catch {
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ];
  }
}
