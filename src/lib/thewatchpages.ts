import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const IMAGE_ROOT = path.join(
  process.cwd(),
  "public/images/watches/thewatchpages/louis-vuitton"
);
const PUBLIC_PREFIX = "/images/watches/thewatchpages/louis-vuitton";

export interface TwpLvProduct {
  sku: string;
  name: string;
  series: string;
  reference: string;
  gender: "MENS" | "WOMENS";
  caseSize: string;
  movement: "AUTOMATIC" | "MANUAL" | "QUARTZ";
  caseMaterial: "STEEL" | "GOLD" | "PLATINUM" | "TWO_TONE" | "TITANIUM" | "CERAMIC";
  strapMaterial: "METAL" | "LEATHER" | "RUBBER" | "FABRIC";
  dial: string;
  waterResistance: string;
  year: number | null;
  category: string;
  description: string;
  sourceImageUrls: string[];
  twpSlug: string;
}

/** Louis Vuitton storefront range: \$999.99–\$1399.98 */
export function toLouisVuittonPrice(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const dollars = 999 + (hash % 401); // 999..1399
  if (dollars === 1399) return 1399.98;
  return Number((dollars + 0.99).toFixed(2));
}

/**
 * Catalog curated from https://www.thewatchpages.com/brands/louis-vuitton
 * with product photography sourced for each reference.
 */
export const TWP_LOUIS_VUITTON_PRODUCTS: TwpLvProduct[] = [
  {
    sku: "QBB174",
    name: "Tambour Street Diver Black Blaze",
    series: "Tambour Street Diver",
    reference: "QBB174",
    gender: "MENS",
    caseSize: "44mm",
    movement: "AUTOMATIC",
    caseMaterial: "TWO_TONE",
    strapMaterial: "RUBBER",
    dial: "Black",
    waterResistance: "100m",
    year: 2021,
    category: "Sport Watches",
    description:
      "Louis Vuitton Tambour Street Diver Black Blaze. Bold 44mm automatic diver with dual screw-down crowns and an internal dive bezel — a signature urban sports watch from The Watch Pages LV catalogue.",
    twpSlug: "louis-vuitton-tambour-street-diver-black-blaze-qbb174",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/8065416182826391.jpg",
      "https://productimg.xbiao.com/65/300_450/8065416182826605.jpg",
      "https://productimg.xbiao.com/65/300_450/8065416182826675.jpg",
      "https://productimg.xbiao.com/65/300_450/8065416182835283.jpg",
    ],
  },
  {
    sku: "QBB175",
    name: "Tambour Street Diver Pacific White",
    series: "Tambour Street Diver",
    reference: "QBB175",
    gender: "WOMENS",
    caseSize: "39.5mm",
    movement: "QUARTZ",
    caseMaterial: "STEEL",
    strapMaterial: "RUBBER",
    dial: "White",
    waterResistance: "100m",
    year: 2021,
    category: "Sport Watches",
    description:
      "Louis Vuitton Tambour Street Diver Pacific White. A 39.5mm quartz Street Diver with a bright white dial and rubber strap — sized for a refined women’s sports look.",
    twpSlug: "louis-vuitton-tambour-street-diver-pacific-white-qbb175",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/8065516182826578.jpg",
      "https://productimg.xbiao.com/65/300_450/8065516182826711.jpg",
      "https://productimg.xbiao.com/65/300_450/8065516182826796.jpg",
      "https://productimg.xbiao.com/65/300_450/8065516182835543.jpg",
    ],
  },
  {
    sku: "QBB201",
    name: "Tambour Street Diver Burning Rock",
    series: "Tambour Street Diver",
    reference: "QBB201",
    gender: "MENS",
    caseSize: "44mm",
    movement: "AUTOMATIC",
    caseMaterial: "STEEL",
    strapMaterial: "RUBBER",
    dial: "Orange",
    waterResistance: "100m",
    year: 2022,
    category: "Sport Watches",
    description:
      "Louis Vuitton Tambour Street Diver Burning Rock. Automatic 44mm steel Street Diver with a vivid orange dial and matching rubber strap.",
    twpSlug: "louis-vuitton-tambour-street-diver-burning-rock-qbb201",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/9478916654839125.jpg",
      "https://productimg.xbiao.com/65/300_450/9478916654839161.jpg",
      "https://productimg.xbiao.com/65/300_450/9478916654839207.jpg",
      "https://productimg.xbiao.com/65/300_450/9478916654841771.jpg",
    ],
  },
  {
    sku: "QBB202",
    name: "Tambour Street Diver Urban Green",
    series: "Tambour Street Diver",
    reference: "QBB202",
    gender: "MENS",
    caseSize: "44mm",
    movement: "AUTOMATIC",
    caseMaterial: "STEEL",
    strapMaterial: "RUBBER",
    dial: "Green",
    waterResistance: "100m",
    year: 2022,
    category: "Sport Watches",
    description:
      "Louis Vuitton Tambour Street Diver Urban Green. Automatic 44mm steel Street Diver with a green dial and rubber strap from the LV sports line.",
    twpSlug: "louis-vuitton-tambour-street-diver-urban-green-qbb202",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/9479116654841181.jpg",
      "https://productimg.xbiao.com/65/300_450/9479116654841222.jpg",
      "https://productimg.xbiao.com/65/300_450/9479116654841265.jpg",
      "https://productimg.xbiao.com/65/300_450/9479116654841616.jpg",
    ],
  },
  {
    sku: "QBB204",
    name: "Tambour Street Diver Chronograph Neon Black",
    series: "Tambour Street Diver",
    reference: "QBB204",
    gender: "MENS",
    caseSize: "46mm",
    movement: "AUTOMATIC",
    caseMaterial: "STEEL",
    strapMaterial: "RUBBER",
    dial: "Black",
    waterResistance: "100m",
    year: 2023,
    category: "Sport Watches",
    description:
      "Louis Vuitton Tambour Street Diver Chronograph Neon Black. Larger chronograph Street Diver with black PVD accents and rubber strap.",
    twpSlug: "louis-vuitton-tambour-street-diver-chronograph-neon-black-qbb204",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/9613716786957324.jpg",
      "https://productimg.xbiao.com/65/300_450/9613716999300377.jpg",
      "https://productimg.xbiao.com/65/300_450/9613716999300319.jpg",
      "https://productimg.xbiao.com/65/300_450/9613716999300395.jpg",
    ],
  },
  {
    sku: "QBB205",
    name: "Tambour Street Diver Chronograph Skyline Blue",
    series: "Tambour Street Diver",
    reference: "QBB205",
    gender: "MENS",
    caseSize: "46mm",
    movement: "AUTOMATIC",
    caseMaterial: "STEEL",
    strapMaterial: "RUBBER",
    dial: "Blue",
    waterResistance: "100m",
    year: 2023,
    category: "Sport Watches",
    description:
      "Louis Vuitton Tambour Street Diver Chronograph Skyline Blue. Automatic chronograph Street Diver with a sunburst blue dial.",
    twpSlug: "louis-vuitton-tambour-street-diver-chronograph-skyline-blue-qbb205",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/9613816920853455.jpg",
      "https://productimg.xbiao.com/65/300_450/9613816786964068.jpg",
      "https://productimg.xbiao.com/65/300_450/9613816987216922.jpg",
      "https://productimg.xbiao.com/65/300_450/9613816987214531.jpg",
    ],
  },
  {
    sku: "QBB167",
    name: "Tambour Monogram",
    series: "Tambour Monogram",
    reference: "QBB167",
    gender: "MENS",
    caseSize: "39.5mm",
    movement: "QUARTZ",
    caseMaterial: "TWO_TONE",
    strapMaterial: "LEATHER",
    dial: "Brown",
    waterResistance: "50m",
    year: 2022,
    category: "Dress Watches",
    description:
      "Louis Vuitton Tambour Monogram. Iconic monogram dial on a drum-shaped Tambour case — a signature LV dress-sports hybrid.",
    twpSlug: "louis-vuitton-tambour-monogram-qbb167",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/9613616786918175.jpg",
      "https://productimg.xbiao.com/65/300_450/9613616994393165.jpg",
      "https://productimg.xbiao.com/65/300_450/9613616994393235.jpg",
    ],
  },
  {
    sku: "QBB186",
    name: "Tambour",
    series: "Tambour",
    reference: "QBB186",
    gender: "MENS",
    caseSize: "40mm",
    movement: "AUTOMATIC",
    caseMaterial: "STEEL",
    strapMaterial: "LEATHER",
    dial: "Black",
    waterResistance: "50m",
    year: 2021,
    category: "Dress Watches",
    description:
      "Louis Vuitton Tambour. Classic drum-case Tambour automatic — the foundation of LV’s watchmaking identity.",
    twpSlug: "louis-vuitton-tambour-qbb186",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/8666316414492202.jpg",
      "https://productimg.xbiao.com/65/300_450/8666316414492244.jpg",
      "https://productimg.xbiao.com/65/300_450/8666316414492288.jpg",
      "https://productimg.xbiao.com/65/300_450/8666316424787407.jpg",
    ],
  },
  {
    sku: "Q1TC60",
    name: "Tambour Convergence",
    series: "Tambour Convergence",
    reference: "Q1TC60",
    gender: "MENS",
    caseSize: "40mm",
    movement: "AUTOMATIC",
    caseMaterial: "STEEL",
    strapMaterial: "LEATHER",
    dial: "Silver",
    waterResistance: "50m",
    year: 2024,
    category: "Dress Watches",
    description:
      "Louis Vuitton Tambour Convergence. Contemporary Tambour with guichet-style time display — a standout from the latest LV collection featured on The Watch Pages.",
    twpSlug: "louis-vuitton-tambour-convergence-q1tc60",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/10494017689825335.jpg",
      "https://productimg.xbiao.com/65/300_450/10494017689825245.jpg",
      "https://productimg.xbiao.com/65/300_450/10494017689825177.jpg",
      "https://productimg.xbiao.com/65/300_450/10494017689825641.jpg",
    ],
  },
  {
    sku: "Q1TA10",
    name: "Tambour Steel",
    series: "Tambour",
    reference: "Q1TA10",
    gender: "MENS",
    caseSize: "40mm",
    movement: "AUTOMATIC",
    caseMaterial: "STEEL",
    strapMaterial: "METAL",
    dial: "Blue",
    waterResistance: "100m",
    year: 2024,
    category: "Sport Watches",
    description:
      "Louis Vuitton Tambour Steel. Clean steel Tambour with bracelet — a versatile men’s everyday luxury watch.",
    twpSlug: "louis-vuitton-tambour-steel-q1ta10",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/10505717702586192.jpg",
    ],
  },
  {
    sku: "W9PG21",
    name: "Tambour Rose Gold",
    series: "Tambour",
    reference: "W9PG21",
    gender: "WOMENS",
    caseSize: "34mm",
    movement: "QUARTZ",
    caseMaterial: "GOLD",
    strapMaterial: "LEATHER",
    dial: "Silver",
    waterResistance: "50m",
    year: 2024,
    category: "Dress Watches",
    description:
      "Louis Vuitton Tambour Rose Gold. Elegant rose-gold Tambour dress watch sized for women.",
    twpSlug: "louis-vuitton-tambour-rose-gold-w9pg21",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/10493817689817488.jpg",
      "https://productimg.xbiao.com/65/300_450/10493817689817553.jpg",
      "https://productimg.xbiao.com/65/300_450/10493817689817667.jpg",
      "https://productimg.xbiao.com/65/300_450/10493817689819391.jpg",
    ],
  },
  {
    sku: "UNITY-2026",
    name: "Unity Time Object",
    series: "Haute Horlogerie",
    reference: "UNITY-2026",
    gender: "MENS",
    caseSize: "42mm",
    movement: "AUTOMATIC",
    caseMaterial: "GOLD",
    strapMaterial: "LEATHER",
    dial: "Black",
    waterResistance: "30m",
    year: 2026,
    category: "Dress Watches",
    description:
      "Louis Vuitton Unity Time Object. Haute horology piece from the Men’s Fall/Winter presentation — a collectible LV complication.",
    twpSlug: "louis-vuitton-unity-time-object",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/10615817799614251.jpg",
      "https://productimg.xbiao.com/65/300_450/10615817799614091.jpg",
      "https://productimg.xbiao.com/65/300_450/10615817799614162.jpg",
      "https://productimg.xbiao.com/65/300_450/10615817799614047.jpg",
    ],
  },
  {
    sku: "QBB170",
    name: "Tambour Slim Monogram",
    series: "Tambour Slim Monogram",
    reference: "QBB170",
    gender: "WOMENS",
    caseSize: "33mm",
    movement: "QUARTZ",
    caseMaterial: "STEEL",
    strapMaterial: "LEATHER",
    dial: "Black",
    waterResistance: "50m",
    year: 2023,
    category: "Dress Watches",
    description:
      "Louis Vuitton Tambour Slim Monogram (33mm). Slim quartz women’s Tambour with monogram detailing and diamond indexes — listed on The Watch Pages.",
    twpSlug: "louis-vuitton-tambour-slim-monogram-qbb170",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/9613616786918175.jpg",
      "https://productimg.xbiao.com/65/300_450/9613616994393165.jpg",
      "https://productimg.xbiao.com/65/300_450/9613616994393235.jpg",
    ],
  },
  {
    sku: "QBB171",
    name: "Tambour Slim Monogram",
    series: "Tambour Slim Monogram",
    reference: "QBB171",
    gender: "WOMENS",
    caseSize: "39mm",
    movement: "QUARTZ",
    caseMaterial: "STEEL",
    strapMaterial: "LEATHER",
    dial: "Black",
    waterResistance: "50m",
    year: 2023,
    category: "Dress Watches",
    description:
      "Louis Vuitton Tambour Slim Monogram (39mm). Larger slim monogram quartz for women, with leather strap and diamond setting.",
    twpSlug: "louis-vuitton-tambour-slim-monogram-qbb171",
    sourceImageUrls: [
      "https://productimg.xbiao.com/65/300_450/9613616994393165.jpg",
      "https://productimg.xbiao.com/65/300_450/9613616786918175.jpg",
      "https://productimg.xbiao.com/65/300_450/9613616994393235.jpg",
    ],
  },
];

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function downloadTwpLvImages(
  product: TwpLvProduct
): Promise<string[]> {
  const dir = path.join(IMAGE_ROOT, product.sku.toLowerCase());
  await mkdir(dir, { recursive: true });
  const localPaths: string[] = [];

  for (let i = 0; i < product.sourceImageUrls.length; i += 1) {
    const src = product.sourceImageUrls[i];
    const filename = `${i + 1}.jpg`;
    const dest = path.join(dir, filename);
    const publicUrl = `${PUBLIC_PREFIX}/${product.sku.toLowerCase()}/${filename}`;

    if (!(await exists(dest))) {
      try {
        const res = await fetch(src, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
            Referer: "https://www.xbiao.com/",
          },
          signal: AbortSignal.timeout(25000),
        });
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 5000) continue;
        await writeFile(dest, buf);
      } catch {
        continue;
      }
    }
    if (await exists(dest)) {
      localPaths.push(publicUrl);
    }
  }

  return localPaths;
}

export function fetchTwpLouisVuittonProducts(): TwpLvProduct[] {
  return TWP_LOUIS_VUITTON_PRODUCTS;
}
