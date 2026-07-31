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
    if (filters.minYear || filters.maxYear) {
      where.year = {};
      if (filters.minYear) (where.year as Record<string, number>).gte = filters.minYear;
      if (filters.maxYear) (where.year as Record<string, number>).lte = filters.maxYear;
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
  } catch {
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
  } catch {
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
        .filter((size) => /\d/.test(size) && !/^[0-9]mm$/.test(size))
        .sort((a, b) => parseFloat(a) - parseFloat(b)),
    };
  } catch {
    return { brands: [], series: [], caseSizes: [] as string[] };
  }
}

export async function getBrandBySlug(slug: string) {
  try {
    return await prisma.brand.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function getRelatedWatches(
  watchId: string,
  brandId: string,
  limit = 4
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
