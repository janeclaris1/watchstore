"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

interface ProductToolbarProps {
  total: number;
  brandSlug?: string;
}

export function ProductToolbar({ total, brandSlug }: ProductToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "newest";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.delete("page");
    const base = brandSlug ? `/watches/${brandSlug}` : "/watches";
    router.push(`${base}?${params.toString()}`);
  }

  const filterPills = [
    { label: "Brands", key: "brand" },
    { label: "Series", key: "series" },
    { label: "Case Size", key: "caseSize" },
    { label: "Price", key: "price" },
    { label: "Year", key: "year" },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-sm text-wf-gray">Results ({total})</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Sort</span>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="text-sm border-0 bg-transparent focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
            <option value="reference">Reference A-Z</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {filterPills.map((pill) => (
          <button
            key={pill.key}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#f1f1f1] hover:bg-[#e8e8e8] text-sm px-4 py-2 transition-colors"
          >
            {pill.label}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        ))}
        <button
          className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#f1f1f1] hover:bg-[#e8e8e8] text-sm px-4 py-2 transition-colors"
        >
          <span>More Filters</span>
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
