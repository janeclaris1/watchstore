"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Heart, Shield, Truck, RotateCcw } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import {
  formatPrice,
  conditionLabel,
  movementLabel,
  caseMaterialLabel,
  strapMaterialLabel,
  cn,
} from "@/lib/utils";

interface ProductGalleryProps {
  images: { url: string; alt: string | null }[];
  model: string;
}

export function ProductGallery({ images, model }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-wf-light cursor-zoom-in"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <Image
          src={images[selected]?.url || "/images/placeholders/watch.svg"}
          alt={images[selected]?.alt || model}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            zoomed && "scale-150"
          )}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.slice(0, 4).map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={cn(
              "relative aspect-square rounded overflow-hidden border-2 transition-colors",
              selected === i ? "border-gold" : "border-transparent hover:border-wf-border"
            )}
          >
            <Image
              src={img.url}
              alt={img.alt || `${model} view ${i + 1}`}
              fill
              className="object-cover"
              sizes="100px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

interface ProductInfoProps {
  watch: {
    id: string;
    slug: string;
    model: string;
    reference: string;
    price: number;
    condition: string;
    description: string;
    conditionReport: string | null;
    year: number | null;
    movement: string;
    caseMaterial: string;
    caseSize: string | null;
    strapMaterial: string;
    dial: string | null;
    waterResistance: string | null;
    hasBox: boolean;
    hasPapers: boolean;
    brand: { name: string; slug: string };
    images: { url: string; alt: string | null }[];
  };
}

export function ProductInfo({ watch }: ProductInfoProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, hasItem } = useWishlistStore();
  const isWishlisted = hasItem(watch.id);
  const primaryImage = watch.images[0]?.url || "";

  const specs = [
    { label: "Year", value: watch.year?.toString() || "N/A" },
    { label: "Movement", value: movementLabel(watch.movement) },
    { label: "Case Material", value: caseMaterialLabel(watch.caseMaterial) },
    { label: "Case Size", value: watch.caseSize || "N/A" },
    { label: "Strap", value: strapMaterialLabel(watch.strapMaterial) },
    { label: "Dial", value: watch.dial || "N/A" },
    { label: "Water Resistance", value: watch.waterResistance || "N/A" },
  ];

  const accordions = [
    { id: "description", title: "Description", content: watch.description },
    { id: "condition", title: "Condition Report", content: watch.conditionReport || "No condition report available." },
    {
      id: "shipping",
      title: "Shipping & Returns",
      content: "Orders are dispatched after successful payment confirmation. Fast express insured delivery worldwide and a 14-day return policy for a full refund.",
    },
  ];

  return (
    <div data-watch-product data-brand={watch.brand.name} data-model={watch.model} data-reference={watch.reference} data-price={watch.price}>
      <nav className="text-sm text-wf-gray mb-4">
        <a href="/" className="hover:text-gold">Home</a>
        <span className="mx-2">/</span>
        <a href="/watches" className="hover:text-gold">Watches</a>
        <span className="mx-2">/</span>
        <a href={`/watches/${watch.brand.slug}`} className="hover:text-gold">{watch.brand.name}</a>
        <span className="mx-2">/</span>
        <span className="text-wf-black">{watch.model}</span>
      </nav>

      <p className="text-xs uppercase tracking-wider font-semibold text-wf-gray mb-1" data-watch-brand>
        {watch.brand.name}
      </p>
      <h1 className="font-playfair text-3xl md:text-4xl mb-2" data-watch-model>{watch.model}</h1>
      <p className="text-sm text-wf-gray mb-4" data-watch-reference>Ref. {watch.reference}</p>

      <p className="font-playfair text-3xl text-gold mb-6" data-watch-price>{formatPrice(watch.price)}</p>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-gold" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Truck className="w-4 h-4 text-gold" />
          <span>Fast Shipping</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <RotateCcw className="w-4 h-4 text-gold" />
          <span>14-Day Returns</span>
        </div>
      </div>

      <div className="flex gap-4 mb-6 text-sm">
        <span className="px-3 py-1 bg-wf-light rounded">{conditionLabel(watch.condition)}</span>
        <span className="px-3 py-1 bg-wf-light rounded">Box</span>
        <span className="px-3 py-1 bg-wf-light rounded">Papers</span>
      </div>

      <table className="w-full text-sm mb-8">
        <tbody>
          {specs.map((spec) => (
            <tr key={spec.label} className="border-b border-wf-border">
              <td className="py-2.5 text-wf-gray w-1/3">{spec.label}</td>
              <td className="py-2.5 font-medium">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() =>
            addItem({
              watchId: watch.id,
              slug: watch.slug,
              brand: watch.brand.name,
              model: watch.model,
              price: watch.price,
              image: primaryImage,
            })
          }
          className="btn-gold flex-1"
        >
          Add to Cart
        </button>
        <button
          onClick={() => toggleItem(watch.id)}
          className="w-12 h-12 border border-wf-border rounded flex items-center justify-center hover:border-gold transition-colors"
        >
          <Heart className={cn("w-5 h-5", isWishlisted && "fill-gold text-gold")} />
        </button>
      </div>

      <div className="border-t border-wf-border">
        {accordions.map((acc) => (
          <div key={acc.id} className="border-b border-wf-border">
            <button
              onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
              className="flex items-center justify-between w-full py-4 text-left font-medium"
            >
              {acc.title}
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  openAccordion === acc.id && "rotate-180"
                )}
              />
            </button>
            {openAccordion === acc.id && (
              <div className="pb-4 text-sm text-wf-gray leading-relaxed">
                {acc.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
