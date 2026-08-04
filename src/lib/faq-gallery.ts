import { prisma } from "@/lib/prisma";
import type { FaqGalleryImage } from "@/components/faq/FaqTopicCards";

const FALLBACK_IMAGES: FaqGalleryImage[] = [
  {
    url: "/images/watches/watchesofswitzerland/tissot/17361943/1.jpg",
    alt: "Tissot watch",
  },
  {
    url: "/images/watches/watchesofswitzerland/vacheron-constantin/17510300/1.jpg",
    alt: "Vacheron Constantin watch",
  },
  {
    url: "/images/watches/watchesofswitzerland/timex/17160506/1.jpg",
    alt: "Timex watch",
  },
  {
    url: "/images/watches/jacob-co/18100312/1.jpg",
    alt: "Jacob and Co watch",
  },
];

export async function getFaqGalleryImages(): Promise<FaqGalleryImage[]> {
  try {
    const rows = await prisma.watchImage.findMany({
      where: { isPrimary: true },
      select: {
        url: true,
        alt: true,
        watch: {
          select: {
            model: true,
            brand: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 250,
    });

    const pool = rows
      .filter((row) => row.url)
      .map((row) => ({
        url: row.url,
        alt:
          row.alt ||
          `${row.watch.brand.name} ${row.watch.model}`.trim() ||
          `${row.watch.brand.name} watch`,
      }));

    if (pool.length >= 3) return pool;
    return FALLBACK_IMAGES;
  } catch {
    return FALLBACK_IMAGES;
  }
}
