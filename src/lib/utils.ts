import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "USD"): string {
  const symbols: Record<string, string> = { GBP: "£", USD: "$", EUR: "€" };
  const symbol = symbols[currency] || "$";
  const value = Number(price);
  return `${symbol}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Map any catalog price into \$299.99–\$499.99 (max under \$500, always ends in .99). */
export function toStorefrontPrice(seed: string): number {
  return toStorefrontPriceInRange(seed, 299, 499);
}

/** Rolex Daytona storefront range: \$1149.99–\$1599.99 (always ends in .99). */
export function toDaytonaPrice(seed: string): number {
  return toStorefrontPriceInRange(seed, 1149, 1599);
}

/** Deterministic .99 price in an inclusive whole-dollar range. */
export function toStorefrontPriceInRange(
  seed: string,
  minDollars: number,
  maxDollars: number
): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const span = Math.max(0, maxDollars - minDollars);
  const dollars = minDollars + (hash % (span + 1));
  return Number((dollars + 0.99).toFixed(2));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function conditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    UNWORN: "New",
    EXCELLENT: "New",
    GOOD: "New",
  };
  return labels[condition] || "New";
}

export function movementLabel(movement: string): string {
  const labels: Record<string, string> = {
    AUTOMATIC: "Automatic",
    MANUAL: "Manual",
    QUARTZ: "Quartz",
  };
  return labels[movement] || movement;
}

export function caseMaterialLabel(material: string): string {
  const labels: Record<string, string> = {
    STEEL: "Steel",
    GOLD: "Gold",
    PLATINUM: "Platinum",
    TWO_TONE: "Two-Tone",
    TITANIUM: "Titanium",
    CERAMIC: "Ceramic",
  };
  return labels[material] || material;
}

export function strapMaterialLabel(material: string): string {
  const labels: Record<string, string> = {
    METAL: "Metal",
    LEATHER: "Leather",
    RUBBER: "Rubber",
    FABRIC: "Fabric",
  };
  return labels[material] || material;
}
