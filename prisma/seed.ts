import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  fetchWatchfinderOffers,
  resolveWatchfinderImage,
  type WatchfinderOffer,
} from "../src/lib/watchfinder";
import {
  fetchWristAficionadoCollection,
  resolveWristAficionadoImage,
  type WristAficionadoProduct,
  type WristCollectionKey,
} from "../src/lib/wristaficionado";
import {
  downloadLuxurytimeImages,
  fetchLuxurytimeCollection,
} from "../src/lib/luxurytime";
import {
  downloadWosImages,
  fetchWosCollection,
} from "../src/lib/watchesofswitzerland";
import { toDaytonaPrice, toStorefrontPrice } from "../src/lib/utils";

const prisma = new PrismaClient();

const brands = [
  { name: "Rolex", slug: "rolex", logo: "/images/brands/rolex.svg" },
  { name: "Patex Philippe", slug: "patek-philippe", logo: "/images/brands/patek-philippe.svg" },
  { name: "Omega", slug: "omega", logo: "/images/brands/omega.svg" },
  { name: "Hublot", slug: "hublot", logo: "/images/brands/hublot.svg" },
  { name: "Cartier", slug: "cartier", logo: "/images/brands/cartier.svg" },
  { name: "Louis Vuitton", slug: "louis-vuitton", logo: "/images/brands/louis-vuitton.svg" },
];

const WATCHFINDER_BRANDS = ["rolex", "omega"];
const IMPORTED_IMAGE_PREFIX = "/images/watches/";
const WRIST_IMPORTS: Array<{
  collectionKey: WristCollectionKey;
  brandSlug: string;
  seriesSlug: string;
  imagePrefix: string;
  excludeImagePrefix?: string;
}> = [
  {
    collectionKey: "daytona",
    brandSlug: "rolex",
    seriesSlug: "daytona",
    imagePrefix: "/images/watches/wristaficionado/",
    excludeImagePrefix: "/images/watches/wristaficionado/nautilus/",
  },
  {
    collectionKey: "nautilus",
    brandSlug: "patek-philippe",
    seriesSlug: "nautilus",
    imagePrefix: "/images/watches/wristaficionado/nautilus/",
  },
  {
    collectionKey: "aquanaut",
    brandSlug: "patek-philippe",
    seriesSlug: "aquanaut",
    imagePrefix: "/images/watches/wristaficionado/aquanaut/",
  },
];

async function removeNonImportedWatches() {
  const nonImportedWhere = {
    images: {
      none: {
        url: { startsWith: IMPORTED_IMAGE_PREFIX },
      },
    },
  };

  await prisma.orderItem.deleteMany({
    where: { watch: nonImportedWhere },
  });
  await prisma.wishlistItem.deleteMany({
    where: { watch: nonImportedWhere },
  });
  const result = await prisma.watch.deleteMany({
    where: nonImportedWhere,
  });
  if (result.count > 0) {
    console.log(`Removed ${result.count} non-imported watches.`);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function normalizeStockType(stockType: string) {
  const normalized = stockType.toLowerCase();
  if (normalized.includes("manufacturer")) return "MANUFACTURER_WARRANTY";
  if (normalized.includes("vintage")) return "VINTAGE";
  return "STANDARD";
}

function inferCondition(_stockType: string, _year: number | null) {
  return "UNWORN" as const;
}

function inferCaseSize(series: string, reference: string) {
  const fromReference = reference
    .split(/[./]/)
    .map((part) => parseInt(part, 10))
    .find((size) => size >= 28 && size <= 48);

  if (fromReference) return `${fromReference}mm`;

  const seriesLower = series.toLowerCase();
  if (seriesLower.includes("ladymatic")) return "34mm";
  if (seriesLower.includes("planet ocean")) return "43.5mm";
  if (seriesLower.includes("speedmaster")) return "42mm";
  if (seriesLower.includes("aqua terra")) return "41mm";
  if (seriesLower.includes("constellation")) return "39mm";
  if (seriesLower.includes("daytona")) return "40mm";
  return "40mm";
}

function inferWaterResistance(series: string) {
  const seriesLower = series.toLowerCase();
  if (seriesLower.includes("planet ocean")) return "600m";
  if (seriesLower.includes("diver") || seriesLower.includes("seamaster 300")) return "300m";
  if (seriesLower.includes("railmaster")) return "150m";
  if (seriesLower.includes("speedmaster")) return "50m";
  if (seriesLower.includes("daytona")) return "100m";
  return "100m";
}

function inferCategory(series: string) {
  const seriesLower = series.toLowerCase();
  if (
    seriesLower.includes("seamaster") ||
    seriesLower.includes("planet ocean") ||
    seriesLower.includes("railmaster")
  ) {
    return "Dive Watches";
  }
  if (seriesLower.includes("speedmaster") || seriesLower.includes("daytona")) {
    return "Sport Watches";
  }
  return "Dress Watches";
}

function inferGender(series: string) {
  if (series.toLowerCase().includes("ladymatic")) return "WOMENS" as const;
  return "UNISEX" as const;
}

function inferCaseMaterial(series: string, reference: string) {
  const text = `${series} ${reference}`.toLowerCase();
  if (text.includes("gold") || text.includes("sedna")) return "GOLD" as const;
  if (text.includes("two-tone") || text.includes("bicolor")) return "TWO_TONE" as const;
  if (text.includes("titanium")) return "TITANIUM" as const;
  if (text.includes("ceramic") || text.includes("dark side")) return "CERAMIC" as const;
  return "STEEL" as const;
}

function inferStrapMaterial(series: string) {
  if (series.toLowerCase().includes("leather")) return "LEATHER" as const;
  if (series.toLowerCase().includes("rubber")) return "RUBBER" as const;
  return "METAL" as const;
}

function buildDescription(offer: WatchfinderOffer) {
  const price = toStorefrontPrice(`${offer.sku}-${offer.reference}`);
  return `${offer.brand} ${offer.series} ${offer.reference}. Special offer price ${price.toLocaleString("en-US")} USD.`;
}

function buildConditionReport(offer: WatchfinderOffer) {
  const stockType = normalizeStockType(offer.stockType);
  if (stockType === "VINTAGE") {
    return "Vintage listing. Full condition details available on request.";
  }
  return "Store listing with full inspection before dispatch.";
}

function buildWristDescription(product: WristAficionadoProduct) {
  const seed = `${product.sku}-${product.reference}`;
  const price =
    product.series.toLowerCase() === "daytona"
      ? toDaytonaPrice(seed)
      : toStorefrontPrice(seed);
  const base =
    product.description ||
    `${product.brand} ${product.series} ${product.reference}.`;
  return `${base} Listed at ${price.toLocaleString("en-US")} USD.`;
}

async function deleteWatchesByImagePrefix(
  brandId: string,
  imagePrefix: string,
  excludePrefix?: string
) {
  const where = {
    brandId,
    images: {
      some: {
        AND: [
          { url: { startsWith: imagePrefix } },
          ...(excludePrefix ? [{ NOT: { url: { startsWith: excludePrefix } } }] : []),
        ],
      },
    },
  };

  await prisma.orderItem.deleteMany({ where: { watch: where } });
  await prisma.wishlistItem.deleteMany({ where: { watch: where } });
  await prisma.watch.deleteMany({ where });
}

async function seedBrandFromWatchfinder(brandSlug: string) {
  const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } });
  if (!brand) {
    console.warn(`Brand not found: ${brandSlug}`);
    return;
  }

  console.log(`Fetching Watchfinder ${brand.name} offers...`);
  const offers = await fetchWatchfinderOffers(brandSlug);

  if (offers.length === 0) {
    console.warn(`No Watchfinder offers found for ${brand.name}`);
    return;
  }

  // Only replace previous Watchfinder imports for this brand (keep Daytona etc.)
  await deleteWatchesByImagePrefix(brand.id, `/images/watches/${brandSlug}/`);

  for (const offer of offers) {
    const seriesName = offer.series.trim();
    const series = await prisma.series.upsert({
      where: {
        brandId_slug: {
          brandId: brand.id,
          slug: slugify(seriesName),
        },
      },
      update: { name: seriesName },
      create: {
        brandId: brand.id,
        name: seriesName,
        slug: slugify(seriesName),
      },
    });

    const watchSlug = slugify(`${brandSlug}-${seriesName}-${offer.sku}`);
    const modelLabel = `${offer.series} ${offer.reference}`;
    const imageUrl = await resolveWatchfinderImage(brandSlug, offer);

    await prisma.watch.create({
      data: {
        slug: watchSlug,
        brandId: brand.id,
        seriesId: series.id,
        model: offer.series,
        reference: offer.reference,
        description: buildDescription(offer),
        conditionReport: buildConditionReport(offer),
        price: toStorefrontPrice(`${offer.sku}-${offer.reference}`),
        condition: inferCondition(offer.stockType, offer.year),
        year: offer.year,
        movement: "AUTOMATIC",
        caseMaterial: inferCaseMaterial(offer.series, offer.reference),
        caseSize: inferCaseSize(offer.series, offer.reference),
        strapMaterial: inferStrapMaterial(offer.series),
        dial: "Black",
        waterResistance: inferWaterResistance(offer.series),
        gender: inferGender(offer.series),
        hasBox: true,
        hasPapers: true,
        featured: true,
        category: inferCategory(offer.series),
        images: {
          create: [
            {
              url: imageUrl,
              alt: modelLabel,
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      },
    });
  }

  console.log(`Imported ${offers.length} ${brand.name} watches from Watchfinder.`);
}

async function seedWristAficionadoCollection(options: {
  collectionKey: WristCollectionKey;
  brandSlug: string;
  seriesSlug: string;
  imagePrefix: string;
  excludeImagePrefix?: string;
}) {
  const brand = await prisma.brand.findUnique({ where: { slug: options.brandSlug } });
  if (!brand) {
    console.warn(`Brand not found: ${options.brandSlug}`);
    return;
  }

  console.log(`Fetching ${options.collectionKey} collection from Wrist Aficionado...`);
  const products = await fetchWristAficionadoCollection(options.collectionKey);

  if (products.length === 0) {
    console.warn(`No products found for ${options.collectionKey}`);
    return;
  }

  await deleteWatchesByImagePrefix(
    brand.id,
    options.imagePrefix,
    options.excludeImagePrefix
  );

  const seriesName = products[0]?.series ?? options.seriesSlug;
  const series = await prisma.series.upsert({
    where: {
      brandId_slug: {
        brandId: brand.id,
        slug: options.seriesSlug,
      },
    },
    update: { name: seriesName },
    create: {
      brandId: brand.id,
      name: seriesName,
      slug: options.seriesSlug,
    },
  });

  let imported = 0;
  for (const product of products) {
    const watchSlug = slugify(
      `${options.brandSlug}-${options.seriesSlug}-${product.sku}-${product.handle}`
    );
    const imageUrl = await resolveWristAficionadoImage(product);
    const year = product.year ?? 2020;
    const stockType = year <= 2000 ? "VINTAGE" : "STANDARD";
    const isLadies =
      /ladies|lady/i.test(product.title) || product.series.toLowerCase().includes("ladies");
    const priceSeed = `${product.sku}-${product.reference}`;
    const price =
      options.seriesSlug === "daytona" || product.series.toLowerCase() === "daytona"
        ? toDaytonaPrice(priceSeed)
        : toStorefrontPrice(priceSeed);

    await prisma.watch.create({
      data: {
        slug: watchSlug,
        brandId: brand.id,
        seriesId: series.id,
        model: product.series,
        reference: product.reference,
        description: buildWristDescription(product),
        conditionReport: product.available
          ? "Available for purchase. Full condition details on request."
          : "Listing imported from supplier catalog.",
        price,
        condition: inferCondition(stockType, product.year),
        year: product.year,
        movement: product.movement,
        caseMaterial: product.caseMaterial,
        caseSize: product.caseSize ?? inferCaseSize(product.series, product.reference),
        strapMaterial: product.strapMaterial,
        dial: product.dial ?? "Black",
        waterResistance:
          product.series.toLowerCase() === "nautilus"
            ? "120m"
            : product.series.toLowerCase() === "aquanaut"
              ? "120m"
              : "100m",
        gender: isLadies ? "WOMENS" : "UNISEX",
        hasBox: true,
        hasPapers: true,
        featured: true,
        category:
          product.series.toLowerCase() === "aquanaut" ||
          product.series.toLowerCase() === "nautilus" ||
          product.series.toLowerCase() === "daytona"
            ? "Sport Watches"
            : inferCategory(product.series),
        images: {
          create: [
            {
              url: imageUrl,
              alt: product.title,
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      },
    });
    imported += 1;
    if (imported % 20 === 0) {
      console.log(`  ...imported ${imported}/${products.length}`);
    }
  }

  console.log(
    `Imported ${imported} ${brand.name} ${seriesName} watches from Wrist Aficionado.`
  );
}

async function seedRolexDaytonaFromWristAficionado() {
  await seedWristAficionadoCollection({
    collectionKey: "daytona",
    brandSlug: "rolex",
    seriesSlug: "daytona",
    imagePrefix: "/images/watches/wristaficionado/",
    excludeImagePrefix: "/images/watches/wristaficionado/nautilus/",
  });
}

async function seedHublotFromLuxurytime() {
  const brand = await prisma.brand.findUnique({ where: { slug: "hublot" } });
  if (!brand) {
    console.warn("Hublot brand not found");
    return;
  }

  console.log("Fetching Hublot collection from Luxurytime...");
  const products = await fetchLuxurytimeCollection("hublot");

  if (products.length === 0) {
    console.warn("No Hublot products found on Luxurytime");
    return;
  }

  await deleteWatchesByImagePrefix(brand.id, "/images/watches/luxurytime/hublot/");

  let imported = 0;
  for (const product of products) {
    const series = await prisma.series.upsert({
      where: {
        brandId_slug: {
          brandId: brand.id,
          slug: slugify(product.series),
        },
      },
      update: { name: product.series },
      create: {
        brandId: brand.id,
        name: product.series,
        slug: slugify(product.series),
      },
    });

    const imagePaths = await downloadLuxurytimeImages(product);
    const watchSlug = slugify(`hublot-${product.series}-${product.sku}`);
    const price = toStorefrontPrice(`${product.sku}-${product.reference}`);

    await prisma.watch.create({
      data: {
        slug: watchSlug,
        brandId: brand.id,
        seriesId: series.id,
        model: product.series,
        reference: product.reference,
        description:
          (product.description || product.title) + ` Listed at ${price.toFixed(2)} USD.`,
        conditionReport: "New condition. Full details available on request.",
        price,
        condition: "UNWORN",
        year: product.year,
        movement: product.movement,
        caseMaterial: product.caseMaterial,
        caseSize: product.caseSize ?? "42mm",
        strapMaterial: product.strapMaterial,
        dial: product.dial ?? "Black",
        waterResistance: "100m",
        gender: product.gender,
        hasBox: true,
        hasPapers: true,
        featured: true,
        category: "Sport Watches",
        images: {
          create: imagePaths.map((url, index) => ({
            url,
            alt: `${product.title} - image ${index + 1}`,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
    });

    imported += 1;
    console.log(`  ...imported ${imported}/${products.length} (${imagePaths.length} images)`);
  }

  console.log(`Imported ${imported} Hublot watches from Luxurytime.`);
}

async function seedCartierFromWatchesOfSwitzerland() {
  const brand = await prisma.brand.findUnique({ where: { slug: "cartier" } });
  if (!brand) {
    console.warn("Cartier brand not found");
    return;
  }

  console.log("Fetching Cartier New Arrivals from Watches of Switzerland...");
  const products = await fetchWosCollection("cartier-new-arrivals");

  if (products.length === 0) {
    console.warn("No Cartier products found");
    return;
  }

  await deleteWatchesByImagePrefix(
    brand.id,
    "/images/watches/watchesofswitzerland/cartier/"
  );

  let imported = 0;
  for (const product of products) {
    const series = await prisma.series.upsert({
      where: {
        brandId_slug: {
          brandId: brand.id,
          slug: slugify(product.series),
        },
      },
      update: { name: product.series },
      create: {
        brandId: brand.id,
        name: product.series,
        slug: slugify(product.series),
      },
    });

    const imagePaths = await downloadWosImages(product);
    const watchSlug = slugify(`cartier-${product.series}-${product.sku}`);
    const price = toStorefrontPrice(`${product.sku}-${product.reference}`);

    await prisma.watch.create({
      data: {
        slug: watchSlug,
        brandId: brand.id,
        seriesId: series.id,
        model: product.series,
        reference: product.reference,
        description:
          (product.description || product.title) + ` Listed at ${price.toFixed(2)} USD.`,
        conditionReport: "New condition. Full details available on request.",
        price,
        condition: "UNWORN",
        year: product.year,
        movement: product.movement,
        caseMaterial: product.caseMaterial,
        caseSize: product.caseSize ?? "36mm",
        strapMaterial: product.strapMaterial,
        dial: product.dial ?? "Silver",
        waterResistance: "30m",
        gender: product.gender,
        hasBox: true,
        hasPapers: true,
        featured: true,
        category: product.category,
        images: {
          create: imagePaths.map((url, index) => ({
            url,
            alt: `${product.title} - image ${index + 1}`,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
    });

    imported += 1;
    if (imported % 20 === 0 || imported === products.length) {
      console.log(`  ...imported ${imported}/${products.length}`);
    }
  }

  console.log(`Imported ${imported} Cartier watches from Watches of Switzerland.`);
}

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@cosyaurawatchstore.com" },
    update: {},
    create: {
      email: "admin@cosyaurawatchstore.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, logo: brand.logo },
      create: brand,
    });
  }

  for (const brandSlug of WATCHFINDER_BRANDS) {
    await seedBrandFromWatchfinder(brandSlug);
  }

  for (const importConfig of WRIST_IMPORTS) {
    await seedWristAficionadoCollection(importConfig);
  }

  await seedHublotFromLuxurytime();
  await seedCartierFromWatchesOfSwitzerland();
  await removeNonImportedWatches();

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
