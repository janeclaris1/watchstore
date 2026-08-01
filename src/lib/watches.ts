import { prisma } from "./prisma";
import type { Watch, Brand, WatchImage } from "@prisma/client";

export type WatchWithRelations = Watch & {
  brand: Brand;
  images: WatchImage[];
};

export const WATCH_PAGE_SIZE = 18;

export interface WatchListFilters {
  brandSlug?: string;
  seriesSlug?: string;
  caseSize?: string;
  minPrice?: number;
  maxPrice?: number;
  conditions?: string[];
  movements?: string[];
  caseMaterials?: string[];
  strapMaterials?: string[];
  minYear?: number;
  maxYear?: number;
  sort?: string;
  page?: number;
  limit?: number;
  gender?: string;
  category?: string;
  hasBox?: boolean;
  hasPapers?: boolean;
}

const MIN_CASE_SIZE_MM = 20;
const MAX_CASE_SIZE_MM = 50;
const MIN_VALID_YEAR = 1950;
const MAX_VALID_YEAR = new Date().getFullYear() + 1;

export function parseCaseSizeMm(size: string | null | undefined): number | null {
  if (!size) return null;
  const match = size.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function isRealisticCaseSize(size: string): boolean {
  const mm = parseCaseSizeMm(size);
  return mm !== null && mm >= MIN_CASE_SIZE_MM && mm <= MAX_CASE_SIZE_MM;
}

export function isRealisticYear(year: number | null | undefined): boolean {
  return (
    typeof year === "number" &&
    Number.isFinite(year) &&
    year >= MIN_VALID_YEAR &&
    year <= MAX_VALID_YEAR
  );
}

export function parseWatchListFilters(
  searchParams: URLSearchParams | Record<string, string | undefined>,
  overrides: Partial<WatchListFilters> = {}
): WatchListFilters {
  const get = (key: string) => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? undefined;
    }
    return searchParams[key];
  };

  return {
    brandSlug: overrides.brandSlug ?? get("brandSlug") ?? get("brand"),
    seriesSlug: get("series"),
    caseSize: get("caseSize"),
    minPrice: get("minPrice") ? Number(get("minPrice")) : undefined,
    maxPrice: get("maxPrice") ? Number(get("maxPrice")) : undefined,
    conditions: get("condition")?.split(",").filter(Boolean),
    movements: get("movement")?.split(",").filter(Boolean),
    caseMaterials: get("caseMaterial")?.split(",").filter(Boolean),
    strapMaterials: get("strapMaterial")?.split(",").filter(Boolean),
    minYear: get("minYear") ? Number(get("minYear")) : undefined,
    maxYear: get("maxYear") ? Number(get("maxYear")) : undefined,
    sort: get("sort"),
    page: overrides.page ?? (get("page") ? Number(get("page")) : 1),
    limit: overrides.limit ?? (get("limit") ? Number(get("limit")) : WATCH_PAGE_SIZE),
    gender: get("gender"),
    category: get("category"),
    hasBox: get("hasBox") === "true" ? true : get("hasBox") === "false" ? false : undefined,
    hasPapers:
      get("hasPapers") === "true" ? true : get("hasPapers") === "false" ? false : undefined,
  };
}

export async function getWatches(filters: WatchListFilters = {}) {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || WATCH_PAGE_SIZE;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters.brandSlug) {
      where.brand = { slug: filters.brandSlug };
    }

    if (filters.seriesSlug) {
      where.series = { slug: filters.seriesSlug };
    }

    if (filters.caseSize) {
      where.caseSize = filters.caseSize;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) (where.price as Record<string, number>).gte = filters.minPrice;
      if (filters.maxPrice) (where.price as Record<string, number>).lte = filters.maxPrice;
    }
    if (filters.conditions?.length) where.condition = { in: filters.conditions };
    if (filters.movements?.length) where.movement = { in: filters.movements };
    if (filters.caseMaterials?.length) where.caseMaterial = { in: filters.caseMaterials };
    if (filters.strapMaterials?.length) where.strapMaterial = { in: filters.strapMaterials };
    if (filters.gender) where.gender = filters.gender;
    if (filters.category) where.category = filters.category;
    if (filters.hasBox !== undefined) where.hasBox = filters.hasBox;
    if (filters.hasPapers !== undefined) where.hasPapers = filters.hasPapers;
    if (filters.minYear || filters.maxYear) {
      const yearFilter: Record<string, number> = {
        gte: MIN_VALID_YEAR,
        lte: MAX_VALID_YEAR,
      };
      if (filters.minYear) yearFilter.gte = Math.max(filters.minYear, MIN_VALID_YEAR);
      if (filters.maxYear) yearFilter.lte = Math.min(filters.maxYear, MAX_VALID_YEAR);
      where.year = yearFilter;
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (filters.sort) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "reference":
        orderBy = { reference: "asc" };
        break;
    }

    const [watches, total] = await Promise.all([
      prisma.watch.findMany({
        where,
        include: { brand: true, images: { orderBy: { sortOrder: "asc" } } },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.watch.count({ where }),
    ]);

    return { watches, total, pages: Math.ceil(total / limit), page, limit };
  } catch (error) {
    console.error("[getWatches] database error:", error);
    return { watches: [], total: 0, pages: 0, page: 1, limit: filters.limit || WATCH_PAGE_SIZE };
  }
}

export async function getFeaturedWatches(limit = 8) {
  try {
    return await prisma.watch.findMany({
      where: { featured: true },
      include: { brand: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getLatestWatches(limit = 12) {
  try {
    return await prisma.watch.findMany({
      include: { brand: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

function shuffleWatches<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Random watch sample for homepage sections. */
export async function getRandomWatches(
  limit = 6,
  options: { excludeIds?: string[]; featuredOnly?: boolean } = {}
) {
  try {
    const poolSize = Math.max(limit * 8, 48);
    const watches = await prisma.watch.findMany({
      where: {
        ...(options.featuredOnly ? { featured: true } : {}),
        ...(options.excludeIds?.length
          ? { id: { notIn: options.excludeIds } }
          : {}),
      },
      include: { brand: true, images: { orderBy: { sortOrder: "asc" } } },
      take: poolSize,
    });
    return shuffleWatches(watches).slice(0, limit);
  } catch {
    return [];
  }
}

export async function getWatchBySlug(slug: string) {
  try {
    return await prisma.watch.findUnique({
      where: { slug },
      include: { brand: true, images: { orderBy: { sortOrder: "asc" } } },
    });
  } catch {
    return null;
  }
}

export async function getWatchesByBrand(
  brandSlug: string,
  filters?: Omit<WatchListFilters, "brandSlug">
) {
  return getWatches({ ...filters, brandSlug });
}

export async function getAllBrands() {
  try {
    return await prisma.brand.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    console.error("[getAllBrands] database error:", error);
    return [];
  }
}

export async function getFilterOptions(brandSlug?: string) {
  try {
    const brand = brandSlug
      ? await prisma.brand.findUnique({ where: { slug: brandSlug } })
      : null;

    const [brands, series, caseSizes] = await Promise.all([
      prisma.brand.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      prisma.series.findMany({
        where: brand ? { brandId: brand.id } : undefined,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          brand: { select: { slug: true, name: true } },
        },
      }),
      prisma.watch.findMany({
        where: {
          caseSize: { not: null },
          ...(brand ? { brandId: brand.id } : {}),
        },
        distinct: ["caseSize"],
        select: { caseSize: true },
        orderBy: { caseSize: "asc" },
      }),
    ]);

    return {
      brands,
      series,
      caseSizes: caseSizes
        .map((row) => row.caseSize)
        .filter((size): size is string => Boolean(size))
        .filter(isRealisticCaseSize)
        .sort((a, b) => (parseCaseSizeMm(a) || 0) - (parseCaseSizeMm(b) || 0)),
    };
  } catch {
    return { brands: [], series: [], caseSizes: [] as string[] };
  }
}

export async function getBrandBySlug(slug: string) {
  try {
    return await prisma.brand.findUnique({ where: { slug } });
  } catch (error) {
    console.error("[getBrandBySlug] database error:", error);
    return null;
  }
}

export async function getRelatedWatches(
  watchId: string,
  brandId: string,
  limit = 18
) {
  return prisma.watch.findMany({
    where: { brandId, NOT: { id: watchId } },
    include: { brand: true, images: { orderBy: { sortOrder: "asc" } } },
    take: limit,
  });
}

export async function getAllWatchSlugs() {
  try {
    return await prisma.watch.findMany({ select: { slug: true } });
  } catch {
    return [];
  }
}

export async function getDashboardStats() {
  const [totalWatches, totalOrders, totalRevenue, recentOrders] =
    await Promise.all([
      prisma.watch.count(),
      prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: { include: { watch: { include: { brand: true } } } } },
      }),
    ]);

  return {
    totalWatches,
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    recentOrders,
  };
}
