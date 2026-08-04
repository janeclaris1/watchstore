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
import {
  downloadMayorsImages,
  fetchMayorsJacobCoProducts,
} from "../src/lib/mayors";
import {
  toBreitlingPrice,
  toDaytonaPrice,
  toJacobCoPrice,
  toStorefrontPrice,
  toTissotPrice,
  toHalfListedPrice,
  toVacheronPrice,
} from "../src/lib/utils";

const prisma = new PrismaClient();

const brands = [
  { name: "Rolex", slug: "rolex", logo: "/images/brands/rolex.png" },
  { name: "Patex Philippe", slug: "patek-philippe", logo: "/images/brands/patek-philippe.png" },
  { name: "Omega", slug: "omega", logo: "/images/brands/omega.png" },
  { name: "Hublot", slug: "hublot", logo: "/images/brands/hublot.png" },
  { name: "Cartier", slug: "cartier", logo: "/images/brands/cartier.png" },
  { name: "Louis Vuitton", slug: "louis-vuitton", logo: "/images/brands/louis-vuitton.png" },
  { name: "Breitling", slug: "breitling", logo: "/images/brands/breitling.svg" },
  { name: "Tudor", slug: "tudor", logo: "/images/brands/tudor.svg" },
  { name: "IWC", slug: "iwc", logo: "/images/brands/iwc.svg" },
  { name: "Panerai", slug: "panerai", logo: "/images/brands/panerai.svg" },
  { name: "Bremont", slug: "bremont", logo: "/images/brands/bremont.svg" },
  { name: "Grand Seiko", slug: "grand-seiko", logo: "/images/brands/grand-seiko.svg" },
  { name: "TAG Heuer", slug: "tag-heuer", logo: "/images/brands/tag-heuer.svg" },
  { name: "Jacob & Co", slug: "jacob-co", logo: "/images/brands/jacob-co.svg" },
  { name: "Tissot", slug: "tissot", logo: "/images/brands/tissot.svg" },
  { name: "Timex", slug: "timex", logo: "/images/brands/timex.svg" },
  {
    name: "Vacheron Constantin",
    slug: "vacheron-constantin",
    logo: "/images/brands/vacheron-constantin.svg",
  },
];

/** .com Watchfinder brands (existing Rolex/Omega pipeline). */
const WATCHFINDER_COM_BRANDS = ["rolex", "omega"];

/** UK Watchfinder special-offer brands - priced \$899.99–\$1299.99. */
const WATCHFINDER_UK_BRANDS = [
  "breitling",
  "hublot",
  "tudor",
  "iwc",
  "panerai",
  "bremont",
  "grand-seiko",
  "tag-heuer",
];

const WATCHFINDER_BRANDS = [...WATCHFINDER_COM_BRANDS, ...WATCHFINDER_UK_BRANDS];
const WATCHFINDER_UK_SET = new Set(WATCHFINDER_UK_BRANDS);
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
  if (seriesLower.includes("galactic 29") || seriesLower.includes("callistino")) return "29mm";
  if (seriesLower.includes("clair de rose") || seriesLower.includes("carrera ladies")) return "30mm";
  if (seriesLower.includes("ladymatic")) return "34mm";
  if (seriesLower.includes("big bang") || seriesLower.includes("king power")) return "44mm";
  if (seriesLower.includes("planet ocean") || seriesLower.includes("submersible")) return "43.5mm";
  if (
    seriesLower.includes("avenger") ||
    seriesLower.includes("superocean") ||
    seriesLower.includes("luminor") ||
    seriesLower.includes("big pilot")
  ) {
    return "44mm";
  }
  if (
    seriesLower.includes("navitimer") ||
    seriesLower.includes("bentley") ||
    seriesLower.includes("black bay") ||
    seriesLower.includes("aquatimer")
  ) {
    return "43mm";
  }
  if (
    seriesLower.includes("chronomat") ||
    seriesLower.includes("colt") ||
    seriesLower.includes("portugieser") ||
    seriesLower.includes("monaco") ||
    seriesLower.includes("carrera")
  ) {
    return "41mm";
  }
  if (seriesLower.includes("speedmaster") || seriesLower.includes("formula 1")) return "42mm";
  if (seriesLower.includes("aqua terra") || seriesLower.includes("aquaracer")) return "41mm";
  if (seriesLower.includes("constellation") || seriesLower.includes("portofino")) return "39mm";
  if (seriesLower.includes("daytona") || seriesLower.includes("premier")) return "40mm";
  return "40mm";
}

function inferWaterResistance(series: string) {
  const seriesLower = series.toLowerCase();
  if (seriesLower.includes("planet ocean") || seriesLower.includes("submersible")) return "600m";
  if (
    seriesLower.includes("superocean") ||
    seriesLower.includes("black bay") ||
    seriesLower.includes("aquaracer") ||
    seriesLower.includes("aquatimer") ||
    seriesLower.includes("supermarine")
  ) {
    return "300m";
  }
  if (
    seriesLower.includes("diver") ||
    seriesLower.includes("seamaster 300") ||
    seriesLower.includes("avenger") ||
    seriesLower.includes("luminor marina")
  ) {
    return "300m";
  }
  if (seriesLower.includes("railmaster") || seriesLower.includes("colt")) return "150m";
  if (seriesLower.includes("speedmaster") || seriesLower.includes("monaco")) return "50m";
  if (
    seriesLower.includes("daytona") ||
    seriesLower.includes("chronomat") ||
    seriesLower.includes("big bang") ||
    seriesLower.includes("carrera")
  ) {
    return "100m";
  }
  if (
    seriesLower.includes("navitimer") ||
    seriesLower.includes("premier") ||
    seriesLower.includes("portofino") ||
    seriesLower.includes("portugieser")
  ) {
    return "30m";
  }
  return "100m";
}

function inferCategory(series: string) {
  const seriesLower = series.toLowerCase();
  if (
    seriesLower.includes("seamaster") ||
    seriesLower.includes("planet ocean") ||
    seriesLower.includes("railmaster") ||
    seriesLower.includes("superocean") ||
    seriesLower.includes("avenger") ||
    seriesLower.includes("black bay") ||
    seriesLower.includes("submariner") ||
    seriesLower.includes("aquaracer") ||
    seriesLower.includes("aquatimer") ||
    seriesLower.includes("submersible") ||
    seriesLower.includes("luminor") ||
    seriesLower.includes("supermarine") ||
    seriesLower.includes("seastar") ||
    seriesLower.includes("deepwater")
  ) {
    return "Dive Watches";
  }
  if (
    seriesLower.includes("speedmaster") ||
    seriesLower.includes("daytona") ||
    seriesLower.includes("navitimer") ||
    seriesLower.includes("chronomat") ||
    seriesLower.includes("colt") ||
    seriesLower.includes("bentley") ||
    seriesLower.includes("big bang") ||
    seriesLower.includes("king power") ||
    seriesLower.includes("carrera") ||
    seriesLower.includes("monaco") ||
    seriesLower.includes("formula 1") ||
    seriesLower.includes("autavia") ||
    seriesLower.includes("pilot") ||
    seriesLower.includes("epic x") ||
    seriesLower.includes("epic sf") ||
    seriesLower.includes("twin turbo") ||
    seriesLower.includes("bugatti") ||
    seriesLower.includes("prx") ||
    seriesLower.includes("t-race") ||
    seriesLower.includes("supersport") ||
    seriesLower.includes("chrono xl") ||
    seriesLower.includes("pr516") ||
    seriesLower.includes("prc 100") ||
    seriesLower.includes("pr 100") ||
    seriesLower.includes("expedition") ||
    seriesLower.includes("waterbury") ||
    seriesLower.includes("q timex") ||
    seriesLower.includes("ironman") ||
    seriesLower.includes("overseas")
  ) {
    return "Sport Watches";
  }
  if (
    seriesLower.includes("astronomia") ||
    seriesLower.includes("fleurs de jardin") ||
    seriesLower.includes("brilliant") ||
    seriesLower.includes("le locle") ||
    seriesLower.includes("ballade") ||
    seriesLower.includes("gentleman") ||
    seriesLower.includes("carson") ||
    seriesLower.includes("classic dream") ||
    seriesLower.includes("everytime") ||
    seriesLower.includes("visodate") ||
    seriesLower.includes("marlin") ||
    seriesLower.includes("weekender") ||
    seriesLower.includes("patrimony") ||
    seriesLower.includes("traditionnelle") ||
    seriesLower.includes("historiques") ||
    seriesLower.includes("égérie") ||
    seriesLower.includes("egerie") ||
    seriesLower.includes("fiftysix")
  ) {
    return "Dress Watches";
  }
  return "Dress Watches";
}

function inferGender(series: string) {
  const seriesLower = series.toLowerCase();
  if (
    seriesLower.includes("ladymatic") ||
    seriesLower.includes("galactic 29") ||
    seriesLower.includes("callistino") ||
    seriesLower.includes("clair de rose") ||
    seriesLower.includes("carrera ladies") ||
    seriesLower.includes("ladies")
  ) {
    return "WOMENS" as const;
  }
  return "UNISEX" as const;
}

function priceForWatchfinderOffer(brandSlug: string, offer: WatchfinderOffer): number {
  const seed = `${offer.sku}-${offer.reference}`;
  if (WATCHFINDER_UK_SET.has(brandSlug)) return toBreitlingPrice(seed);
  return toStorefrontPrice(seed);
}

function inferCaseMaterial(series: string, reference: string) {
  const text = `${series} ${reference}`.toLowerCase();
  if (text.includes("gold") || text.includes("sedna") || text.includes("bronzo")) return "GOLD" as const;
  if (text.includes("two-tone") || text.includes("bicolor")) return "TWO_TONE" as const;
  if (text.includes("titanium") || text.includes("carbotech")) return "TITANIUM" as const;
  if (text.includes("ceramic") || text.includes("dark side")) return "CERAMIC" as const;
  return "STEEL" as const;
}

function inferStrapMaterial(series: string) {
  if (series.toLowerCase().includes("leather")) return "LEATHER" as const;
  if (series.toLowerCase().includes("rubber")) return "RUBBER" as const;
  return "METAL" as const;
}

function buildDescription(offer: WatchfinderOffer, brandSlug: string) {
  const price = priceForWatchfinderOffer(brandSlug, offer);
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

  const locale = WATCHFINDER_UK_SET.has(brandSlug) ? "uk" : "com";
  console.log(`Fetching Watchfinder ${brand.name} offers (${locale})...`);
  const offers = await fetchWatchfinderOffers(brandSlug, {
    locale,
    brandName: brand.name,
  });

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
        description: buildDescription(offer, brandSlug),
        conditionReport: buildConditionReport(offer),
        price: priceForWatchfinderOffer(brandSlug, offer),
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

async function seedJacobCoFromMayors() {
  const brand = await prisma.brand.findUnique({ where: { slug: "jacob-co" } });
  if (!brand) {
    console.warn("Jacob & Co brand not found");
    return;
  }

  console.log("Fetching Jacob & Co collection from Mayors...");
  const products = await fetchMayorsJacobCoProducts();

  if (products.length === 0) {
    console.warn("No Jacob & Co products found on Mayors");
    return;
  }

  await deleteWatchesByImagePrefix(brand.id, "/images/watches/jacob-co/");

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

    const imagePaths = await downloadMayorsImages(product);
    if (imagePaths.length === 0) {
      console.warn(`  skip ${product.reference} (no images)`);
      continue;
    }

    const watchSlug = slugify(`jacob-co-${product.series}-${product.sku}`);
    const price = toJacobCoPrice(`${product.sku}-${product.reference}`);

    await prisma.watch.create({
      data: {
        slug: watchSlug,
        brandId: brand.id,
        seriesId: series.id,
        model: product.title,
        reference: product.reference,
        description:
          `${product.description} Listed at ${price.toFixed(2)} USD.`,
        conditionReport: "New condition. Full details available on request.",
        price,
        condition: "UNWORN",
        year: null,
        movement: product.movement,
        caseMaterial: product.caseMaterial,
        caseSize: product.caseSize,
        strapMaterial: product.strapMaterial,
        dial: product.dial,
        waterResistance: "30m",
        gender: product.gender,
        hasBox: true,
        hasPapers: true,
        featured: true,
        category: product.category || inferCategory(product.series),
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
    console.log(
      `  ...imported ${imported}/${products.length} [${product.series}] ${product.reference}`
    );
  }

  console.log(`Imported ${imported} Jacob & Co watches from Mayors.`);
}

async function seedTissotFromWatchesOfSwitzerland() {
  const brand = await prisma.brand.findUnique({ where: { slug: "tissot" } });
  if (!brand) {
    console.warn("Tissot brand not found");
    return;
  }

  console.log("Fetching Tissot collection from Watches of Switzerland...");
  const products = await fetchWosCollection("tissot");

  if (products.length === 0) {
    console.warn("No Tissot products found");
    return;
  }

  await deleteWatchesByImagePrefix(
    brand.id,
    "/images/watches/watchesofswitzerland/tissot/"
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

    let imagePaths: string[];
    try {
      imagePaths = await downloadWosImages(product);
    } catch (error) {
      console.warn(
        `  skip ${product.reference || product.sku}: ${
          error instanceof Error ? error.message : error
        }`
      );
      continue;
    }

    const modelName = product.title.split("|")[0].trim().replace(/^Tissot\s+/i, "");
    const watchSlug = slugify(`tissot-${product.series}-${product.sku}`);
    const price = toTissotPrice(`${product.sku}-${product.reference}`);

    await prisma.watch.create({
      data: {
        slug: watchSlug,
        brandId: brand.id,
        seriesId: series.id,
        model: modelName,
        reference: product.reference,
        description:
          (product.description || product.title) +
          ` Listed at ${price.toFixed(2)} USD.`,
        conditionReport: "New condition. Full details available on request.",
        price,
        condition: "UNWORN",
        year: product.year,
        movement: product.movement,
        caseMaterial: product.caseMaterial,
        caseSize: product.caseSize ?? "40mm",
        strapMaterial: product.strapMaterial,
        dial: product.dial ?? "Silver",
        waterResistance: product.category === "Dive Watches" ? "300m" : "100m",
        gender: product.gender,
        hasBox: true,
        hasPapers: true,
        featured: imported < 12,
        category: product.category || inferCategory(product.series),
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
      console.log(`  ...imported ${imported}/${products.length} [${product.series}]`);
    }
  }

  console.log(`Imported ${imported} Tissot watches from Watches of Switzerland.`);
}

async function seedTimexFromWatchesOfSwitzerland() {
  const brand = await prisma.brand.findUnique({ where: { slug: "timex" } });
  if (!brand) {
    console.warn("Timex brand not found");
    return;
  }

  console.log("Fetching Timex collection from Watches of Switzerland...");
  const products = await fetchWosCollection("timex");

  if (products.length === 0) {
    console.warn("No Timex products found");
    return;
  }

  await deleteWatchesByImagePrefix(
    brand.id,
    "/images/watches/watchesofswitzerland/timex/"
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

    let imagePaths: string[];
    try {
      imagePaths = await downloadWosImages(product);
    } catch (error) {
      console.warn(
        `  skip ${product.reference || product.sku}: ${
          error instanceof Error ? error.message : error
        }`
      );
      continue;
    }

    const modelName = product.title
      .split("|")[0]
      .trim()
      .replace(/^Timex\s+/i, "")
      .replace(/®/g, "");
    const watchSlug = slugify(`timex-${product.series}-${product.sku}`);
    const price = toHalfListedPrice(product.price);

    await prisma.watch.create({
      data: {
        slug: watchSlug,
        brandId: brand.id,
        seriesId: series.id,
        model: modelName,
        reference: product.reference,
        description:
          (product.description || product.title) +
          ` Listed at ${price.toFixed(2)} USD.`,
        conditionReport: "New condition. Full details available on request.",
        price,
        condition: "UNWORN",
        year: product.year,
        movement: product.movement,
        caseMaterial: product.caseMaterial,
        caseSize: product.caseSize ?? "40mm",
        strapMaterial: product.strapMaterial,
        dial: product.dial ?? "Silver",
        waterResistance: product.category === "Dive Watches" ? "200m" : "50m",
        gender: product.gender,
        hasBox: true,
        hasPapers: true,
        featured: imported < 12,
        category: product.category || inferCategory(product.series),
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
      console.log(
        `  ...imported ${imported}/${products.length} [${product.series}] $${price.toFixed(2)}`
      );
    }
  }

  console.log(`Imported ${imported} Timex watches from Watches of Switzerland.`);
}

async function seedVacheronFromWatchesOfSwitzerland() {
  const brand = await prisma.brand.findUnique({
    where: { slug: "vacheron-constantin" },
  });
  if (!brand) {
    console.warn("Vacheron Constantin brand not found");
    return;
  }

  console.log("Fetching Vacheron Constantin from Watches of Switzerland...");
  const products = await fetchWosCollection("vacheron-constantin");

  if (products.length === 0) {
    console.warn("No Vacheron Constantin products found");
    return;
  }

  await deleteWatchesByImagePrefix(
    brand.id,
    "/images/watches/watchesofswitzerland/vacheron-constantin/"
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

    let imagePaths: string[];
    try {
      imagePaths = await downloadWosImages(product);
    } catch (error) {
      console.warn(
        `  skip ${product.reference || product.sku}: ${
          error instanceof Error ? error.message : error
        }`
      );
      continue;
    }

    const modelName = product.title
      .split("|")[0]
      .trim()
      .replace(/^Vacheron Constantin\s+/i, "");
    const watchSlug = slugify(
      `vacheron-constantin-${product.series}-${product.sku}`
    );
    const price = toVacheronPrice(`${product.sku}-${product.reference}`);

    await prisma.watch.create({
      data: {
        slug: watchSlug,
        brandId: brand.id,
        seriesId: series.id,
        model: modelName,
        reference: product.reference,
        description:
          (product.description || product.title) +
          ` Listed at ${price.toFixed(2)} USD.`,
        conditionReport: "New condition. Full details available on request.",
        price,
        condition: "UNWORN",
        year: product.year,
        movement: product.movement,
        caseMaterial: product.caseMaterial,
        caseSize: product.caseSize ?? "40mm",
        strapMaterial: product.strapMaterial,
        dial: product.dial ?? "Silver",
        waterResistance: product.series === "Overseas" ? "150m" : "30m",
        gender: product.gender,
        hasBox: true,
        hasPapers: true,
        featured: imported < 12,
        category: product.category || inferCategory(product.series),
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
    if (imported % 15 === 0 || imported === products.length) {
      console.log(
        `  ...imported ${imported}/${products.length} [${product.series}]`
      );
    }
  }

  console.log(
    `Imported ${imported} Vacheron Constantin watches from Watches of Switzerland.`
  );
}

async function main() {
  console.log("Seeding database...");

  const only = process.env.SEED_ONLY?.trim().toLowerCase();

  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@cosyaura.us" },
    update: {
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email: "admin@cosyaura.us",
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

  if (only === "cartier") {
    await seedCartierFromWatchesOfSwitzerland();
    console.log("Seeding complete!");
    return;
  }

  if (only === "jacob-co" || only === "jacob") {
    await seedJacobCoFromMayors();
    console.log("Seeding complete!");
    return;
  }

  if (only === "tissot") {
    await seedTissotFromWatchesOfSwitzerland();
    console.log("Seeding complete!");
    return;
  }

  if (only === "timex") {
    await seedTimexFromWatchesOfSwitzerland();
    console.log("Seeding complete!");
    return;
  }

  if (
    only === "vacheron-constantin" ||
    only === "vacheron" ||
    only === "vc"
  ) {
    await seedVacheronFromWatchesOfSwitzerland();
    console.log("Seeding complete!");
    return;
  }

  if (only === "watchfinder-uk") {
    for (const brandSlug of WATCHFINDER_UK_BRANDS) {
      await seedBrandFromWatchfinder(brandSlug);
    }
    console.log("Seeding complete!");
    return;
  }

  if (only) {
    const targets = only
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const brandSlug of targets) {
      if (brandSlug === "cartier") {
        await seedCartierFromWatchesOfSwitzerland();
      } else if (brandSlug === "jacob-co" || brandSlug === "jacob") {
        await seedJacobCoFromMayors();
      } else if (brandSlug === "tissot") {
        await seedTissotFromWatchesOfSwitzerland();
      } else if (brandSlug === "timex") {
        await seedTimexFromWatchesOfSwitzerland();
      } else if (
        brandSlug === "vacheron-constantin" ||
        brandSlug === "vacheron" ||
        brandSlug === "vc"
      ) {
        await seedVacheronFromWatchesOfSwitzerland();
      } else if (WATCHFINDER_BRANDS.includes(brandSlug)) {
        await seedBrandFromWatchfinder(brandSlug);
      } else {
        console.warn(`Unknown SEED_ONLY target: ${brandSlug}`);
      }
    }
    console.log("Seeding complete!");
    return;
  }

  for (const brandSlug of WATCHFINDER_BRANDS) {
    await seedBrandFromWatchfinder(brandSlug);
  }

  for (const importConfig of WRIST_IMPORTS) {
    await seedWristAficionadoCollection(importConfig);
  }

  await seedHublotFromLuxurytime();
  await seedCartierFromWatchesOfSwitzerland();
  await seedJacobCoFromMayors();
  await seedTissotFromWatchesOfSwitzerland();
  await seedTimexFromWatchesOfSwitzerland();
  await seedVacheronFromWatchesOfSwitzerland();
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
