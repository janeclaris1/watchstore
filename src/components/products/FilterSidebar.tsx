"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";

interface FilterSidebarProps {
  brandSlug?: string;
}

export function FilterSidebar({ brandSlug }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      const base = brandSlug ? `/watches/${brandSlug}` : "/watches";
      router.push(`${base}?${params.toString()}`);
    },
    [router, searchParams, brandSlug]
  );

  const toggleArrayFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(key)?.split(",").filter(Boolean) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (updated.length) {
        params.set(key, updated.join(","));
      } else {
        params.delete(key);
      }
      params.delete("page");
      const base = brandSlug ? `/watches/${brandSlug}` : "/watches";
      router.push(`${base}?${params.toString()}`);
    },
    [router, searchParams, brandSlug]
  );

  const conditions = [
    { value: "UNWORN", label: "New" },
  ];

  const movements = [
    { value: "AUTOMATIC", label: "Automatic" },
    { value: "MANUAL", label: "Manual" },
    { value: "QUARTZ", label: "Quartz" },
  ];

  const caseMaterials = [
    { value: "STEEL", label: "Steel" },
    { value: "GOLD", label: "Gold" },
    { value: "PLATINUM", label: "Platinum" },
    { value: "TWO_TONE", label: "Two-Tone" },
  ];

  const strapMaterials = [
    { value: "METAL", label: "Metal" },
    { value: "LEATHER", label: "Leather" },
    { value: "RUBBER", label: "Rubber" },
  ];

  const activeConditions = searchParams.get("condition")?.split(",") || [];
  const activeMovements = searchParams.get("movement")?.split(",") || [];
  const activeCaseMaterials = searchParams.get("caseMaterial")?.split(",") || [];
  const activeStrapMaterials = searchParams.get("strapMaterial")?.split(",") || [];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-8">
      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={searchParams.get("minPrice") || ""}
              onBlur={(e) => updateFilter("minPrice", e.target.value || null)}
              className="w-full px-3 py-2 border border-wf-border rounded text-sm focus:outline-none focus:border-gold"
            />
            <input
              type="number"
              placeholder="Max"
              defaultValue={searchParams.get("maxPrice") || ""}
              onBlur={(e) => updateFilter("maxPrice", e.target.value || null)}
              className="w-full px-3 py-2 border border-wf-border rounded text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Condition</h3>
        <div className="space-y-2">
          {conditions.map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeConditions.includes(c.value)}
                onChange={() => toggleArrayFilter("condition", c.value)}
                className="rounded border-wf-border text-gold focus:ring-gold"
              />
              <span className="text-sm">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Year Range */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Year</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="From"
            defaultValue={searchParams.get("minYear") || ""}
            onBlur={(e) => updateFilter("minYear", e.target.value || null)}
            className="w-full px-3 py-2 border border-wf-border rounded text-sm focus:outline-none focus:border-gold"
          />
          <input
            type="number"
            placeholder="To"
            defaultValue={searchParams.get("maxYear") || ""}
            onBlur={(e) => updateFilter("maxYear", e.target.value || null)}
            className="w-full px-3 py-2 border border-wf-border rounded text-sm focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Movement */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Movement</h3>
        <div className="space-y-2">
          {movements.map((m) => (
            <label key={m.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeMovements.includes(m.value)}
                onChange={() => toggleArrayFilter("movement", m.value)}
                className="rounded border-wf-border text-gold focus:ring-gold"
              />
              <span className="text-sm">{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Case Material */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Case Material</h3>
        <div className="space-y-2">
          {caseMaterials.map((m) => (
            <label key={m.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeCaseMaterials.includes(m.value)}
                onChange={() => toggleArrayFilter("caseMaterial", m.value)}
                className="rounded border-wf-border text-gold focus:ring-gold"
              />
              <span className="text-sm">{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Strap Material */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Strap Material</h3>
        <div className="space-y-2">
          {strapMaterials.map((m) => (
            <label key={m.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeStrapMaterials.includes(m.value)}
                onChange={() => toggleArrayFilter("strapMaterial", m.value)}
                className="rounded border-wf-border text-gold focus:ring-gold"
              />
              <span className="text-sm">{m.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function ActiveFilters({ brandSlug }: { brandSlug?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: { key: string; label: string; value: string }[] = [];

  const filterLabels: Record<string, string> = {
    minPrice: "Min Price",
    maxPrice: "Max Price",
    condition: "Condition",
    movement: "Movement",
    caseMaterial: "Case",
    strapMaterial: "Strap",
    minYear: "From Year",
    maxYear: "To Year",
    gender: "Gender",
    category: "Category",
    series: "Series",
    caseSize: "Case Size",
    brand: "Brand",
    brandSlug: "Brand",
  };

  searchParams.forEach((value, key) => {
    if (key !== "sort" && key !== "page" && key !== "view") {
      filters.push({ key, label: filterLabels[key] || key, value });
    }
  });

  if (filters.length === 0) return null;

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    const base = brandSlug ? `/watches/${brandSlug}` : "/watches";
    router.push(`${base}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => removeFilter(f.key)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-wf-light border border-wf-border rounded-full text-xs hover:border-gold transition-colors"
        >
          {f.label}: {f.value.replace(/,/g, ", ")}
          <X className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
}
