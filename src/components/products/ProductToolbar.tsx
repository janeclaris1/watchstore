"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandOption = { id: string; name: string; slug: string };
type SeriesOption = {
  id: string;
  name: string;
  slug: string;
  brand: { slug: string; name: string };
};

interface ProductToolbarProps {
  total: number;
  brandSlug?: string;
  brands?: BrandOption[];
  series?: SeriesOption[];
  caseSizes?: string[];
}

const PRICE_PRESETS = [
  { label: "Under $500", min: null, max: "500" },
  { label: "$500 – $999", min: "500", max: "999" },
  { label: "$1,000 – $1,299", min: "1000", max: "1299" },
  { label: "$1,300+", min: "1300", max: null },
];

const YEAR_PRESETS = [
  { label: "2024+", min: "2024", max: null },
  { label: "2020 – 2023", min: "2020", max: "2023" },
  { label: "2015 – 2019", min: "2015", max: "2019" },
  { label: "Before 2015", min: null, max: "2014" },
];

const CONDITIONS = [
  { value: "UNWORN", label: "New" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
];

const MOVEMENTS = [
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "MANUAL", label: "Manual" },
  { value: "QUARTZ", label: "Quartz" },
];

const CASE_MATERIALS = [
  { value: "STEEL", label: "Steel" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
  { value: "TWO_TONE", label: "Two-Tone" },
  { value: "TITANIUM", label: "Titanium" },
  { value: "CERAMIC", label: "Ceramic" },
];

const STRAP_MATERIALS = [
  { value: "METAL", label: "Metal" },
  { value: "LEATHER", label: "Leather" },
  { value: "RUBBER", label: "Rubber" },
  { value: "FABRIC", label: "Fabric" },
];

export function ProductToolbar({
  total,
  brandSlug,
  brands = [],
  series = [],
  caseSizes = [],
}: ProductToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "newest";
  const [open, setOpen] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const base = brandSlug ? `/watches/${brandSlug}` : "/watches";

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${base}?${qs}` : base);
    },
    [base, router, searchParams]
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      pushParams((params) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      setOpen(null);
    },
    [pushParams]
  );

  const setRange = useCallback(
    (minKey: string, maxKey: string, min: string | null, max: string | null) => {
      pushParams((params) => {
        if (min) params.set(minKey, min);
        else params.delete(minKey);
        if (max) params.set(maxKey, max);
        else params.delete(maxKey);
      });
      setOpen(null);
    },
    [pushParams]
  );

  const toggleArray = useCallback(
    (key: string, value: string) => {
      pushParams((params) => {
        const current = params.get(key)?.split(",").filter(Boolean) || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        if (updated.length) params.set(key, updated.join(","));
        else params.delete(key);
      });
    },
    [pushParams]
  );

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!barRef.current?.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const activeBrand = brandSlug || searchParams.get("brand") || "";
  const activeSeries = searchParams.get("series") || "";
  const activeCaseSize = searchParams.get("caseSize") || "";
  const hasPrice = Boolean(searchParams.get("minPrice") || searchParams.get("maxPrice"));
  const hasYear = Boolean(searchParams.get("minYear") || searchParams.get("maxYear"));
  const moreCount = [
    "condition",
    "movement",
    "caseMaterial",
    "strapMaterial",
    "gender",
    "hasBox",
    "hasPapers",
  ].filter((key) => searchParams.get(key)).length;

  const filteredSeries = brandSlug
    ? series
    : activeBrand
      ? series.filter((s) => s.brand.slug === activeBrand)
      : series;

  function selectBrand(slug: string | null) {
    setOpen(null);
    if (!slug) {
      router.push("/watches");
      return;
    }
    if (brandSlug) {
      router.push(`/watches/${slug}`);
      return;
    }
    router.push(`/watches/${slug}`);
  }

  const pills: {
    id: string;
    label: string;
    active: boolean;
    hidden?: boolean;
  }[] = [
    { id: "brands", label: "Brands", active: Boolean(activeBrand), hidden: Boolean(brandSlug) },
    { id: "series", label: "Series", active: Boolean(activeSeries) },
    { id: "caseSize", label: "Case Size", active: Boolean(activeCaseSize) },
    { id: "price", label: "Price", active: hasPrice },
    { id: "year", label: "Year", active: hasYear },
  ];

  return (
    <div className="mb-6" ref={barRef}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-sm text-wf-gray">Results ({total})</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Sort</span>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="text-sm border-0 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
            <option value="reference">Reference A-Z</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin">
        {pills
          .filter((pill) => !pill.hidden)
          .map((pill) => (
            <div key={pill.id} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setOpen(open === pill.id ? null : pill.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full text-sm px-3.5 sm:px-4 py-2 transition-colors whitespace-nowrap",
                  pill.active || open === pill.id
                    ? "bg-wf-black text-white"
                    : "bg-[#f1f1f1] hover:bg-[#e8e8e8] text-wf-black"
                )}
              >
                {pill.label}
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform",
                    open === pill.id && "rotate-180"
                  )}
                />
              </button>

              {open === pill.id && (
                <div className="absolute left-0 top-full mt-2 z-40 w-[min(90vw,280px)] max-h-[60vh] overflow-y-auto rounded-xl border border-wf-border bg-white shadow-lg p-2">
                  {pill.id === "brands" && (
                    <div className="flex flex-wrap items-center gap-1">
                      <DropdownItem
                        label="All brands"
                        active={!activeBrand}
                        onClick={() => selectBrand(null)}
                        horizontal
                      />
                      {brands.map((brand) => (
                        <DropdownItem
                          key={brand.id}
                          label={brand.name}
                          active={activeBrand === brand.slug}
                          onClick={() => selectBrand(brand.slug)}
                          horizontal
                        />
                      ))}
                    </div>
                  )}

                  {pill.id === "series" && (
                    <>
                      <DropdownItem
                        label="All series"
                        active={!activeSeries}
                        onClick={() => setParam("series", null)}
                      />
                      {filteredSeries.length === 0 && (
                        <p className="px-3 py-2 text-sm text-wf-gray">No series available</p>
                      )}
                      {filteredSeries.map((item) => (
                        <DropdownItem
                          key={item.id}
                          label={
                            brandSlug
                              ? item.name
                              : `${item.name} (${item.brand.name})`
                          }
                          active={activeSeries === item.slug}
                          onClick={() => {
                            if (brandSlug || activeBrand) {
                              setParam("series", item.slug);
                              return;
                            }
                            // Scope to the series brand so slug collisions stay accurate
                            router.push(
                              `/watches/${item.brand.slug}?series=${encodeURIComponent(item.slug)}`
                            );
                            setOpen(null);
                          }}
                        />
                      ))}
                    </>
                  )}

                  {pill.id === "caseSize" && (
                    <>
                      <DropdownItem
                        label="All sizes"
                        active={!activeCaseSize}
                        onClick={() => setParam("caseSize", null)}
                      />
                      {caseSizes.length === 0 && (
                        <p className="px-3 py-2 text-sm text-wf-gray">No sizes available</p>
                      )}
                      {caseSizes.map((size) => (
                        <DropdownItem
                          key={size}
                          label={size}
                          active={activeCaseSize === size}
                          onClick={() => setParam("caseSize", size)}
                        />
                      ))}
                    </>
                  )}

                  {pill.id === "price" && (
                    <>
                      <DropdownItem
                        label="Any price"
                        active={!hasPrice}
                        onClick={() => setRange("minPrice", "maxPrice", null, null)}
                      />
                      {PRICE_PRESETS.map((preset) => (
                        <DropdownItem
                          key={preset.label}
                          label={preset.label}
                          active={
                            (searchParams.get("minPrice") || "") === (preset.min || "") &&
                            (searchParams.get("maxPrice") || "") === (preset.max || "")
                          }
                          onClick={() =>
                            setRange("minPrice", "maxPrice", preset.min, preset.max)
                          }
                        />
                      ))}
                      <div className="border-t border-wf-border mt-2 pt-2 px-2 space-y-2">
                        <p className="text-xs text-wf-gray px-1">Custom range</p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            defaultValue={searchParams.get("minPrice") || ""}
                            className="w-full px-2 py-1.5 border border-wf-border rounded text-sm"
                            id="filter-min-price"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            defaultValue={searchParams.get("maxPrice") || ""}
                            className="w-full px-2 py-1.5 border border-wf-border rounded text-sm"
                            id="filter-max-price"
                          />
                        </div>
                        <button
                          type="button"
                          className="w-full btn-gold text-sm py-2"
                          onClick={() => {
                            const min = (
                              document.getElementById("filter-min-price") as HTMLInputElement
                            )?.value;
                            const max = (
                              document.getElementById("filter-max-price") as HTMLInputElement
                            )?.value;
                            setRange(
                              "minPrice",
                              "maxPrice",
                              min || null,
                              max || null
                            );
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    </>
                  )}

                  {pill.id === "year" && (
                    <>
                      <DropdownItem
                        label="Any year"
                        active={!hasYear}
                        onClick={() => setRange("minYear", "maxYear", null, null)}
                      />
                      {YEAR_PRESETS.map((preset) => (
                        <DropdownItem
                          key={preset.label}
                          label={preset.label}
                          active={
                            (searchParams.get("minYear") || "") === (preset.min || "") &&
                            (searchParams.get("maxYear") || "") === (preset.max || "")
                          }
                          onClick={() =>
                            setRange("minYear", "maxYear", preset.min, preset.max)
                          }
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

        <button
          type="button"
          onClick={() => {
            setOpen(null);
            setMoreOpen(true);
          }}
          className={cn(
            "shrink-0 inline-flex items-center gap-2 rounded-full text-sm px-3.5 sm:px-4 py-2 transition-colors whitespace-nowrap",
            moreCount > 0
              ? "bg-wf-black text-white"
              : "bg-[#f1f1f1] hover:bg-[#e8e8e8] text-wf-black"
          )}
        >
          <span>More Filters{moreCount > 0 ? ` (${moreCount})` : ""}</span>
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {moreOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-none shadow-xl max-h-[85vh] sm:max-h-none overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-wf-border px-4 py-4 flex items-center justify-between">
              <h2 className="font-playfair text-xl">More Filters</h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-1 hover:text-gold"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              <MoreFilterGroup title="Condition">
                {CONDITIONS.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(searchParams.get("condition") || "")
                        .split(",")
                        .includes(item.value)}
                      onChange={() => toggleArray("condition", item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </MoreFilterGroup>

              <MoreFilterGroup title="Completeness">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={searchParams.get("hasBox") === "true"}
                    onChange={() =>
                      setParam("hasBox", searchParams.get("hasBox") === "true" ? null : "true")
                    }
                  />
                  With box
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={searchParams.get("hasPapers") === "true"}
                    onChange={() =>
                      setParam(
                        "hasPapers",
                        searchParams.get("hasPapers") === "true" ? null : "true"
                      )
                    }
                  />
                  With papers
                </label>
              </MoreFilterGroup>

              <MoreFilterGroup title="Movement">
                {MOVEMENTS.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(searchParams.get("movement") || "")
                        .split(",")
                        .includes(item.value)}
                      onChange={() => toggleArray("movement", item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </MoreFilterGroup>

              <MoreFilterGroup title="Case Material">
                {CASE_MATERIALS.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(searchParams.get("caseMaterial") || "")
                        .split(",")
                        .includes(item.value)}
                      onChange={() => toggleArray("caseMaterial", item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </MoreFilterGroup>

              <MoreFilterGroup title="Strap Material">
                {STRAP_MATERIALS.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(searchParams.get("strapMaterial") || "")
                        .split(",")
                        .includes(item.value)}
                      onChange={() => toggleArray("strapMaterial", item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </MoreFilterGroup>

              <MoreFilterGroup title="Gender">
                {[
                  { value: "MENS", label: "Men's" },
                  { value: "WOMENS", label: "Women's" },
                  { value: "UNISEX", label: "Unisex" },
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="gender"
                      checked={searchParams.get("gender") === item.value}
                      onChange={() => setParam("gender", item.value)}
                    />
                    {item.label}
                  </label>
                ))}
                <button
                  type="button"
                  className="text-xs text-gold"
                  onClick={() => setParam("gender", null)}
                >
                  Clear gender
                </button>
              </MoreFilterGroup>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-wf-border p-4 flex gap-3">
              <button
                type="button"
                className="btn-outline flex-1"
                onClick={() => {
                  pushParams((params) => {
                    [
                      "condition",
                      "movement",
                      "caseMaterial",
                      "strapMaterial",
                      "gender",
                      "hasBox",
                      "hasPapers",
                    ].forEach((key) => params.delete(key));
                  });
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn-gold flex-1"
                onClick={() => setMoreOpen(false)}
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  label,
  active,
  onClick,
  horizontal = false,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  horizontal?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-wf-light transition-colors",
        horizontal && "w-auto shrink-0 whitespace-nowrap",
        active && "bg-wf-light text-gold font-medium"
      )}
    >
      {label}
    </button>
  );
}

function MoreFilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
