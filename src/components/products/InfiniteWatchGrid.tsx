"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import type { WatchWithRelations } from "@/lib/watches";
import { WATCH_PAGE_SIZE } from "@/lib/watches";

interface InfiniteWatchGridProps {
  initialWatches: WatchWithRelations[];
  total: number;
  pageSize?: number;
  brandSlug?: string;
  emptyMessage?: string;
}

export function InfiniteWatchGrid({
  initialWatches,
  total,
  pageSize = WATCH_PAGE_SIZE,
  brandSlug,
  emptyMessage = "No watches found matching your criteria.",
}: InfiniteWatchGridProps) {
  const searchParams = useSearchParams();
  const filterKey = searchParams.toString();
  const [watches, setWatches] = useState(initialWatches);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialWatches.length < total);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWatches(initialWatches);
    setPage(1);
    setHasMore(initialWatches.length < total);
  }, [filterKey, initialWatches, total]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(nextPage));
      params.set("limit", String(pageSize));
      if (brandSlug) params.set("brandSlug", brandSlug);

      const response = await fetch(`/api/watches?${params.toString()}`);
      if (!response.ok) return;

      const data = await response.json();
      setWatches((current) => {
        const merged = [...current, ...data.watches];
        setHasMore(merged.length < data.total);
        return merged;
      });
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }, [brandSlug, hasMore, loading, page, pageSize, searchParams]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (watches.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-wf-gray text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
        {watches.map((watch) => (
          <ProductCard key={watch.id} watch={watch} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-10 mt-8 flex items-center justify-center">
        {loading && <div className="skeleton w-40 h-4 rounded" />}
        {!loading && !hasMore && watches.length > pageSize && (
          <p className="text-sm text-wf-gray">You&apos;ve seen all {total} watches</p>
        )}
      </div>
    </>
  );
}
