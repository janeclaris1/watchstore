import Link from "next/link";

const BRANDS = [
  {
    name: "Rolex",
    slug: "rolex",
    logo: "/images/brands/rolex.svg",
    width: 120,
  },
  {
    name: "Patex Philippe",
    slug: "patek-philippe",
    logo: "/images/brands/patek-philippe.svg",
    width: 140,
  },
  {
    name: "Omega",
    slug: "omega",
    logo: "/images/brands/omega.svg",
    width: 120,
  },
  {
    name: "Hublot",
    slug: "hublot",
    logo: "/images/brands/hublot.svg",
    width: 120,
  },
  {
    name: "Cartier",
    slug: "cartier",
    logo: "/images/brands/cartier.svg",
    width: 130,
  },
  {
    name: "Louis Vuitton",
    slug: "louis-vuitton",
    logo: "/images/brands/louis-vuitton.svg",
    width: 140,
  },
];

export function BrandStrip() {
  return (
    <section className="py-10 border-b border-wf-border overflow-hidden bg-white">
      <div className="flex gap-10 md:gap-14 animate-scroll overflow-x-auto scrollbar-hide px-4 justify-center items-center">
        {BRANDS.map((brand) => (
          <Link
            key={brand.slug}
            href={`/watches/${brand.slug}`}
            className="shrink-0 opacity-50 hover:opacity-100 transition-opacity duration-300"
            aria-label={brand.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logo}
              alt={brand.name}
              width={brand.width}
              height={40}
              className="h-9 w-auto object-contain"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
