"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store";
import { formatPrice, conditionLabel, cn } from "@/lib/utils";

interface ProductCardProps {
  watch: {
    id: string;
    slug: string;
    model: string;
    reference?: string;
    price: number;
    condition: string;
    year?: number | null;
    hasBox?: boolean;
    hasPapers?: boolean;
    brand: { name: string };
    images: { url: string; alt: string | null }[];
  };
  currency?: string;
}

export function ProductCard({ watch, currency = "USD" }: ProductCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { toggleItem, hasItem } = useWishlistStore();
  const isWishlisted = hasItem(watch.id);
  const primaryImage = watch.images[0]?.url || "/images/placeholders/watch.svg";
  const discountByCondition: Record<string, number> = {
    UNWORN: 7,
    EXCELLENT: 10,
    GOOD: 15,
  };
  const discount = discountByCondition[watch.condition] ?? 8;
  const originalPrice = Number(
    (Math.floor(watch.price / (1 - discount / 100)) + 0.99).toFixed(2)
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="fade-in-scroll group">
      <Link href={`/watches/${watch.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-[#fafafa] mb-3">
          <Image
            src={primaryImage}
            alt={watch.images[0]?.alt || watch.model}
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <span className="absolute top-2 left-2 bg-[#ff4d7d] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleItem(watch.id);
            }}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-white transition-colors border border-wf-border"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isWishlisted ? "fill-gold text-gold" : "text-wf-gray"
              )}
            />
          </button>
        </div>
        <p className="text-xs text-wf-gray mb-0.5">{watch.brand.name}</p>
        <p className="text-sm font-semibold text-wf-black mb-0.5 leading-tight">
          {watch.model}
        </p>
        {watch.reference && (
          <p className="text-xs text-wf-gray mb-2">{watch.reference}</p>
        )}
        <div className="flex items-center gap-2 text-xs mb-1">
          <span className="font-medium">Box</span>
          <span>{watch.hasBox ? "✓" : "✕"}</span>
          <span className="font-medium">Papers</span>
          <span>{watch.hasPapers ? "✓" : "✕"}</span>
        </div>
        {watch.year && (
          <p className="text-xs text-wf-gray mb-1">Year {watch.year}</p>
        )}
        <p className="font-playfair text-[26px] leading-none text-[#ff4d7d]">
          {formatPrice(watch.price, currency)}
        </p>
        <p className="text-sm text-wf-black/70 line-through mt-0.5">
          {formatPrice(originalPrice, currency)}
        </p>
        <p className="text-xs text-wf-gray mt-1">{conditionLabel(watch.condition)}</p>
        <p className="text-xs text-cyan-700 mt-0.5">Store Warranty</p>
      </Link>
    </div>
  );
}
