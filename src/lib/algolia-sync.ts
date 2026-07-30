import { prisma } from "./prisma";

export async function syncWatchesToAlgolia() {
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;

  if (!adminKey || !appId) {
    console.log("Algolia credentials not configured, skipping sync");
    return;
  }

  const { algoliasearch } = await import("algoliasearch");
  const client = algoliasearch(appId, adminKey);

  const watches = await prisma.watch.findMany({
    include: { brand: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const records = watches.map((w) => ({
    objectID: w.id,
    slug: w.slug,
    brand: w.brand.name,
    brandSlug: w.brand.slug,
    model: w.model,
    reference: w.reference,
    description: w.description,
    price: w.price,
    condition: w.condition,
    movement: w.movement,
    caseMaterial: w.caseMaterial,
    strapMaterial: w.strapMaterial,
    year: w.year,
    gender: w.gender,
    image: w.images[0]?.url || "",
    featured: w.featured,
    category: w.category,
    createdAt: w.createdAt.getTime(),
  }));

  await client.setSettings({
    indexName: "watches",
    indexSettings: {
      searchableAttributes: ["brand", "model", "reference", "description"],
      attributesForFaceting: [
        "filterOnly(brand)",
        "filterOnly(condition)",
        "filterOnly(movement)",
        "filterOnly(caseMaterial)",
        "filterOnly(strapMaterial)",
        "filterOnly(price)",
      ],
      customRanking: ["asc(price)", "desc(createdAt)"],
    },
  });

  await client.saveObjects({ indexName: "watches", objects: records });
  console.log(`Synced ${records.length} watches to Algolia`);
}
