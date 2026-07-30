import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://www.watchesofswitzerland.com";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface WosCollectionConfig {
  handle: string;
  imageDir: string;
  defaultBrand: string;
}

export const WOS_COLLECTIONS = {
  "cartier-new-arrivals": {
    handle: "cartier-new-arrivals",
    imageDir: "watchesofswitzerland/cartier",
    defaultBrand: "Cartier",
  },
} as const satisfies Record<string, WosCollectionConfig>;

export type WosCollectionKey = keyof typeof WOS_COLLECTIONS;

export interface WosProduct {
  id: string;
  sku: string;
  handle: string;
  title: string;
  brand: string;
  series: string;
  reference: string;
  year: number | null;
  price: number;
  description: string;
  imageUrls: string[];
  caseSize: string | null;
  hasBox: boolean;
  hasPapers: boolean;
  movement: "AUTOMATIC" | "MANUAL" | "QUARTZ";
  caseMaterial: "STEEL" | "GOLD" | "PLATINUM" | "TWO_TONE" | "TITANIUM" | "CERAMIC";
  strapMaterial: "METAL" | "LEATHER" | "RUBBER" | "FABRIC";
  dial: string | null;
  gender: "MENS" | "WOMENS" | "UNISEX";
  category: string;
  available: boolean;
  url: string;
  imageDir: string;
}

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  tags: string[];
  variants: Array<{
    id: number;
    sku: string | null;
    price: string;
    available: boolean;
  }>;
  images: Array<{ src: string }>;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSeries(title: string): string {
  const head = title.split("|")[0].toLowerCase();

  if (head.includes("santos-dumont")) return "Santos-Dumont";
  if (head.includes("santos")) return "Santos";
  if (head.includes("tank must")) return "Tank Must";
  if (head.includes("tank louis")) return "Tank Louis Cartier";
  if (head.includes("tank française") || head.includes("tank francaise")) {
    return "Tank Française";
  }
  if (head.includes("tank américaine") || head.includes("tank americaine")) {
    return "Tank Américaine";
  }
  if (head.includes("tank")) return "Tank";
  if (head.includes("panthère") || head.includes("panthere")) return "Panthère";
  if (head.includes("ballon bleu")) return "Ballon Bleu";
  if (head.includes("baignoire")) return "Baignoire";
  if (head.includes("pasha")) return "Pasha";
  if (head.includes("roadster")) return "Roadster";
  if (head.includes("ronde")) return "Ronde";
  if (head.includes("clé de cartier") || head.includes("cle de cartier")) {
    return "Clé de Cartier";
  }
  if (head.includes("drive")) return "Drive";
  if (head.includes("tortue")) return "Tortue";
  if (head.includes("crash")) return "Crash";

  return title.split("|")[0].trim().replace(/\s+(Large|Small|Medium|Mini) Model.*/i, "").trim();
}

function parseReference(title: string, handle: string, sku: string): string {
  const fromTitle = title.match(/Ref\.?\s*([A-Z0-9]+)/i);
  if (fromTitle) return fromTitle[1].toUpperCase();

  const fromHandle = handle.match(/-(w[a-z0-9]{5,})-\d+$/i);
  if (fromHandle) return fromHandle[1].toUpperCase();

  return sku.toUpperCase();
}

function parseCaseSize(title: string): string | null {
  const match = title.match(/(\d+(?:\.\d+)?)\s*mm/i);
  return match ? `${match[1]}mm` : null;
}

function parseCaseMaterial(title: string): WosProduct["caseMaterial"] {
  const text = title.toLowerCase();
  if (text.includes("two-tone") || text.includes("two tone") || text.includes("steel &")) {
    return "TWO_TONE";
  }
  if (text.includes("platinum")) return "PLATINUM";
  if (text.includes("yellow gold") || text.includes("rose gold") || text.includes("white gold") || text.includes("18k")) {
    return "GOLD";
  }
  if (text.includes("titanium")) return "TITANIUM";
  return "STEEL";
}

function parseStrapMaterial(title: string): WosProduct["strapMaterial"] {
  const text = title.toLowerCase();
  if (text.includes("leather") || text.includes("alligator")) return "LEATHER";
  if (text.includes("rubber")) return "RUBBER";
  if (text.includes("fabric") || text.includes("nato")) return "FABRIC";
  return "METAL";
}

function parseDial(title: string): string | null {
  const match = title.match(
    /(Silver|White|Ivory|Blue|Black|Champagne|Grey|Gray|Green|Pink|Roman)(?:\s+Dial)?/i
  );
  return match?.[1] ?? null;
}

function parseGender(title: string, tags: string[]): WosProduct["gender"] {
  const text = `${title} ${tags.join(" ")}`.toLowerCase();
  if (text.includes("women") || text.includes("ladies") || text.includes("mini model")) {
    return "WOMENS";
  }
  if (text.includes("small model") && (text.includes("panthère") || text.includes("tank") || text.includes("baignoire"))) {
    return "WOMENS";
  }
  return "UNISEX";
}

function parseCategory(series: string, tags: string[]): string {
  const text = `${series} ${tags.join(" ")}`.toLowerCase();
  if (text.includes("sport") || text.includes("santos")) return "Sport Watches";
  if (text.includes("dive")) return "Dive Watches";
  return "Dress Watches";
}

function parseMovement(title: string, tags: string[]): WosProduct["movement"] {
  const text = `${title} ${tags.join(" ")}`.toLowerCase();
  if (text.includes("quartz") || text.includes("solarbeat")) return "QUARTZ";
  if (text.includes("manual")) return "MANUAL";
  return "AUTOMATIC";
}

function highResShopifyImage(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("width")) {
      parsed.searchParams.set("width", "1200");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function mapWosProduct(
  product: ShopifyProduct,
  config: WosCollectionConfig
): WosProduct | null {
  const variant = product.variants[0];
  const images = (product.images ?? []).map((img) => highResShopifyImage(img.src));
  if (!variant || images.length === 0) return null;

  const tags = product.tags ?? [];
  const sku = variant.sku?.trim() || String(product.id);
  const series = parseSeries(product.title);

  return {
    id: String(product.id),
    sku,
    handle: product.handle,
    title: product.title,
    brand: product.vendor || config.defaultBrand,
    series,
    reference: parseReference(product.title, product.handle, sku),
    year: null,
    price: Math.round(Number(variant.price)),
    description: stripHtml(product.body_html || product.title),
    imageUrls: images,
    caseSize: parseCaseSize(product.title),
    hasBox: true,
    hasPapers: true,
    movement: parseMovement(product.title, tags),
    caseMaterial: parseCaseMaterial(product.title),
    strapMaterial: parseStrapMaterial(product.title),
    dial: parseDial(product.title),
    gender: parseGender(product.title, tags),
    category: parseCategory(series, tags),
    available: Boolean(variant.available),
    url: `${BASE_URL}/products/${product.handle}`,
    imageDir: config.imageDir,
  };
}

export async function fetchWosCollection(
  collectionKey: WosCollectionKey
): Promise<WosProduct[]> {
  const config = WOS_COLLECTIONS[collectionKey];
  const url = `${BASE_URL}/collections/${config.handle}/products.json?limit=250`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Watches of Switzerland ${config.handle}: ${response.status}`
    );
  }

  const data = (await response.json()) as { products: ShopifyProduct[] };
  return (data.products ?? [])
    .map((product) => mapWosProduct(product, config))
    .filter((product): product is WosProduct => product !== null);
}

export async function downloadWosImages(product: WosProduct): Promise<string[]> {
  const safeSku = product.sku.replace(/[^\w.-]/g, "_");
  const outputDir = path.join(
    process.cwd(),
    "public/images/watches",
    product.imageDir,
    safeSku
  );
  await mkdir(outputDir, { recursive: true });

  const localPaths: string[] = [];

  for (let index = 0; index < product.imageUrls.length; index += 1) {
    const imageUrl = product.imageUrls[index];
    const response = await fetch(imageUrl, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      console.warn(`Skipping image ${index + 1} for ${product.sku}: ${response.status}`);
      continue;
    }

    const filename = `${index + 1}.jpg`;
    const outputPath = path.join(outputDir, filename);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(outputPath, buffer);
    localPaths.push(`/images/watches/${product.imageDir}/${safeSku}/${filename}`);
  }

  if (localPaths.length === 0) {
    throw new Error(`No images downloaded for ${product.sku}`);
  }

  return localPaths;
}
