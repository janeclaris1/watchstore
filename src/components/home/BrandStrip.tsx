import Image from "next/image";
import Link from "next/link";

const BRANDS = [
  { name: "Rolex", slug: "rolex", logo: "https://placehold.co/120x40/666666/FFFFFF?text=ROLEX" },
  { name: "Patex Philippe", slug: "patek-philippe", logo: "https://placehold.co/120x40/666666/FFFFFF?text=PATEX" },
  { name: "Omega", slug: "omega", logo: "https://placehold.co/120x40/666666/FFFFFF?text=OMEGA" },
  { name: "Hublot", slug: "hublot", logo: "https://placehold.co/120x40/666666/FFFFFF?text=HUBLOT" },
  { name: "Cartier", slug: "cartier", logo: "https://placehold.co/120x40/666666/FFFFFF?text=CARTIER" },
  { name: "Louis Vuitton", slug: "louis-vuitton", logo: "https://placehold.co/120x40/666666/FFFFFF?text=LV" },
];

export function BrandStrip() {
  return (
    <section className="py-10 border-b border-wf-border overflow-hidden">
      <div className="flex gap-12 animate-scroll overflow-x-auto scrollbar-hide px-4 justify-center">
        {BRANDS.map((brand) => (
          <Link
            key={brand.slug}
            href={`/watches/${brand.slug}`}
            className="shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
          >
            <Image
              src={brand.logo}
              alt={brand.name}
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
