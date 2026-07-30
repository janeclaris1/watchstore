import {
  downloadWatchfinderImage,
  fetchWatchfinderOffers,
} from "../src/lib/watchfinder";

const brandSlug = process.argv[2] ?? "rolex";

async function main() {
  console.log(`Fetching ${brandSlug} offers from Watchfinder...`);
  const offers = await fetchWatchfinderOffers(brandSlug);

  if (offers.length === 0) {
    throw new Error(`No offers found on Watchfinder for ${brandSlug}.`);
  }

  console.log(`Found ${offers.length} offers. Downloading images...`);

  for (const offer of offers) {
    const localPath = await downloadWatchfinderImage(brandSlug, offer.sku, offer.imageUrl);
    console.log(`${offer.reference} (${offer.year}) [${offer.sku}] -> ${localPath}`);
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
