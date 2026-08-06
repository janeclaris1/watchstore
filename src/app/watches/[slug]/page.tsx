import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CitizenBrandBanner } from "@/components/brands/CitizenBrandBanner";
import { ProductCard } from "@/components/products/ProductCard";
import { ActiveFilters } from "@/components/products/FilterSidebar";
import { InfiniteWatchGrid } from "@/components/products/InfiniteWatchGrid";
import { ProductToolbar } from "@/components/products/ProductToolbar";
import { ProductGallery, ProductInfo } from "@/components/products/ProductDetail";
import {
  getWatchBySlug,
  getRelatedWatches,
  getWatches,
  getBrandBySlug,
  getAllWatchSlugs,
  getAllBrands,
  getFilterOptions,
  parseWatchListFilters,
  WATCH_PAGE_SIZE,
} from "@/lib/watches";
import type { Metadata } from "next";

export const revalidate = 300;

interface PageProps {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
}

export async function generateStaticParams() {
  try {
    const [watchSlugs, brands] = await Promise.all([
      getAllWatchSlugs(),
      getAllBrands(),
    ]);
    return [
      ...watchSlugs.map((w) => ({ slug: w.slug })),
      ...brands.map((b) => ({ slug: b.slug })),
    ];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const brand = await getBrandBySlug(params.slug);
  if (brand) {
    return {
      title: `${brand.name} Watches`,
      description: `Shop new ${brand.name} luxury watches with secure checkout and delivery after payment.`,
    };
  }

  const watch = await getWatchBySlug(params.slug);
  if (!watch) return { title: "Not Found" };

  const primaryImage = watch.images[0]?.url;
  return {
    title: `${watch.brand.name} ${watch.model} ${watch.reference}`,
    description: watch.description.slice(0, 160),
    openGraph: {
      title: `${watch.brand.name} ${watch.model}`,
      description: watch.description.slice(0, 160),
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

async function BrandListing({
  brandSlug,
  searchParams,
}: {
  brandSlug: string;
  searchParams: Record<string, string | undefined>;
}) {
  const brand = await getBrandBySlug(brandSlug);
  if (!brand) notFound();

  const filters = parseWatchListFilters(searchParams, {
    brandSlug,
    page: 1,
    limit: WATCH_PAGE_SIZE,
  });

  const [{ watches, total }, options] = await Promise.all([
    getWatches(filters),
    getFilterOptions(brandSlug),
  ]);

  return (
    <>
      {brandSlug === "citizen" && <CitizenBrandBanner />}
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <Suspense>
          <ProductToolbar
          total={total}
          brandSlug={brandSlug}
          brands={options.brands}
          series={options.series}
          caseSizes={options.caseSizes}
        />
      </Suspense>
      <Suspense>
        <ActiveFilters brandSlug={brandSlug} />
      </Suspense>

      <Suspense>
        <InfiniteWatchGrid
          initialWatches={watches}
          total={total}
          pageSize={WATCH_PAGE_SIZE}
          brandSlug={brandSlug}
          emptyMessage={`No ${brand.name} watches found.`}
        />
      </Suspense>
      </div>
    </>
  );
}

async function ProductDetail({ slug }: { slug: string }) {
  const watch = await getWatchBySlug(slug);
  if (!watch) notFound();

  const related = await getRelatedWatches(watch.id, watch.brandId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${watch.brand.name} ${watch.model}`,
    description: watch.description,
    sku: watch.reference,
    brand: { "@type": "Brand", name: watch.brand.name },
    image: watch.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: watch.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <ProductGallery images={watch.images} model={watch.model} />
          <ProductInfo watch={watch} />
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-playfair text-2xl mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {related.map((w) => (
                <ProductCard key={w.id} watch={w} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default async function WatchSlugPage({ params, searchParams }: PageProps) {
  const brand = await getBrandBySlug(params.slug);
  if (brand) {
    return <BrandListing brandSlug={params.slug} searchParams={searchParams} />;
  }

  return <ProductDetail slug={params.slug} />;
}
