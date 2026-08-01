import { unstable_noStore as noStore } from "next/cache";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { BrandStrip } from "@/components/home/BrandStrip";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { PromoBanners } from "@/components/home/PromoBanners";
import { FeatureCtaPanels } from "@/components/home/FeatureCtaPanels";
import { ReviewsSlider } from "@/components/home/ReviewsSlider";
import { RequestWatchBanner } from "@/components/home/RequestWatchBanner";
import { WhyBuyFromUs } from "@/components/home/WhyBuyFromUs";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { ProductCard } from "@/components/products/ProductCard";
import { getRandomWatches } from "@/lib/watches";
import Link from "next/link";

export default async function HomePage() {
  noStore();

  const latest = await getRandomWatches(8);
  const featured = await getRandomWatches(8, {
    excludeIds: latest.map((watch) => watch.id),
  });
  const featuredFirstRow = featured.slice(0, 4);
  const featuredSecondRow = featured.slice(4, 8);

  return (
    <>
      <HeroCarousel />
      <BrandStrip />
      <FeaturedCategories />

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-playfair text-3xl">Latest Arrivals</h2>
            <Link href="/watches" className="text-sm text-gold hover:text-gold-light transition-colors">
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {latest.map((watch) => (
              <ProductCard key={watch.id} watch={watch} />
            ))}
          </div>
        </div>
      </section>

      <PromoBanners />

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-playfair text-3xl">Featured Selection</h2>
            <Link href="/watches" className="text-sm text-gold hover:text-gold-light transition-colors">
              View All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredFirstRow.map((watch) => (
              <ProductCard key={watch.id} watch={watch} />
            ))}
          </div>

          <div className="my-10 md:my-12">
            <FeatureCtaPanels />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredSecondRow.map((watch) => (
              <ProductCard key={watch.id} watch={watch} />
            ))}
          </div>
        </div>
      </section>

      <ReviewsSlider />
      <RequestWatchBanner />
      <WhyBuyFromUs />
      <NewsletterSignup />
    </>
  );
}
