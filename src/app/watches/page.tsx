import { Suspense } from "react";
import { ActiveFilters } from "@/components/products/FilterSidebar";
import { InfiniteWatchGrid } from "@/components/products/InfiniteWatchGrid";
import { ProductToolbar } from "@/components/products/ProductToolbar";
import {
  getFilterOptions,
  getWatches,
  parseWatchListFilters,
  WATCH_PAGE_SIZE,
} from "@/lib/watches";

export const revalidate = 300;

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function WatchesPage({ searchParams }: PageProps) {
  const filters = parseWatchListFilters(searchParams, { page: 1, limit: WATCH_PAGE_SIZE });
  const [{ watches, total }, options] = await Promise.all([
    getWatches(filters),
    getFilterOptions(filters.brandSlug),
  ]);

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-6">
      <div className="flex-1">
        <Suspense>
          <ProductToolbar
            total={total}
            brands={options.brands}
            series={options.series}
            caseSizes={options.caseSizes}
          />
        </Suspense>
        <Suspense>
          <ActiveFilters />
        </Suspense>

        <Suspense>
          <InfiniteWatchGrid initialWatches={watches} total={total} pageSize={WATCH_PAGE_SIZE} />
        </Suspense>
      </div>
    </div>
  );
}
