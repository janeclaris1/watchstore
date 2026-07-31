import { PrismaClient } from "@prisma/client";
import {
  downloadTwpLvImages,
  fetchTwpLouisVuittonProducts,
  toLouisVuittonPrice,
} from "../src/lib/thewatchpages";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function main() {
  const brand = await prisma.brand.upsert({
    where: { slug: "louis-vuitton" },
    update: { name: "Louis Vuitton" },
    create: {
      name: "Louis Vuitton",
      slug: "louis-vuitton",
      logo: "/images/brands/louis-vuitton.svg",
    },
  });

  // Replace previous TWP LV imports only
  const existing = await prisma.watch.findMany({
    where: {
      brandId: brand.id,
      images: { some: { url: { startsWith: "/images/watches/thewatchpages/louis-vuitton/" } } },
    },
    select: { id: true },
  });
  const ids = existing.map((w) => w.id);
  if (ids.length) {
    await prisma.orderItem.deleteMany({ where: { watchId: { in: ids } } });
    await prisma.wishlistItem.deleteMany({ where: { watchId: { in: ids } } });
    await prisma.watchImage.deleteMany({ where: { watchId: { in: ids } } });
    await prisma.watch.deleteMany({ where: { id: { in: ids } } });
    console.log(`Removed ${ids.length} previous TWP Louis Vuitton watches.`);
  }

  const products = fetchTwpLouisVuittonProducts();
  console.log(`Importing ${products.length} Louis Vuitton watches from The Watch Pages catalogue...`);

  let imported = 0;
  for (const product of products) {
    const series = await prisma.series.upsert({
      where: {
        brandId_slug: { brandId: brand.id, slug: slugify(product.series) },
      },
      update: { name: product.series },
      create: {
        brandId: brand.id,
        name: product.series,
        slug: slugify(product.series),
      },
    });

    const images = await downloadTwpLvImages(product);
    if (images.length === 0) {
      console.warn(`  skip ${product.reference}: no images`);
      continue;
    }

    const price = toLouisVuittonPrice(`${product.sku}-${product.reference}`);
    const watchSlug = slugify(`louis-vuitton-${product.series}-${product.reference}`);

    await prisma.watch.create({
      data: {
        slug: watchSlug,
        brandId: brand.id,
        seriesId: series.id,
        model: product.name,
        reference: product.reference,
        description: `${product.description} Listed at ${price.toFixed(2)} USD.`,
        conditionReport: "Brand new. Authentic Louis Vuitton. Box and papers included.",
        price,
        condition: "UNWORN",
        year: product.year,
        movement: product.movement,
        caseMaterial: product.caseMaterial,
        caseSize: product.caseSize,
        strapMaterial: product.strapMaterial,
        dial: product.dial,
        waterResistance: product.waterResistance,
        gender: product.gender,
        hasBox: true,
        hasPapers: true,
        featured: true,
        category: product.category,
        images: {
          create: images.map((url, index) => ({
            url,
            alt: `${product.name} - image ${index + 1}`,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
    });

    imported += 1;
    console.log(
      `  ${product.reference} [${product.gender}] $${price.toFixed(2)} (${images.length} images)`
    );
  }

  const totals = await prisma.watch.groupBy({
    by: ["gender"],
    where: { brandId: brand.id },
    _count: true,
  });
  console.log(`Done. Imported ${imported}. Gender counts:`, totals);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
