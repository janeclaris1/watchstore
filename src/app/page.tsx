import { HeroCarousel } from "@/components/home/HeroCarousel";
import { BrandStrip } from "@/components/home/BrandStrip";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { WhyBuyFromUs } from "@/components/home/WhyBuyFromUs";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { ProductCard } from "@/components/products/ProductCard";
import { getLatestWatches } from "@/lib/watches";
import Link from "next/link";

export const revalidate = 300;

export default async function HomePage() {
  const watches = await getLatestWatches(9);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {watches.map((watch) => (
              <ProductCard key={watch.id} watch={watch} />
            ))}
          </div>
        </div>
      </section>

      <WhyBuyFromUs />
      <NewsletterSignup />
    </>
  );
}
