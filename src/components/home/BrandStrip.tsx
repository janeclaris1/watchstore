import Image from "next/image";
import Link from "next/link";

const LOGO_BOX = 56; // uniform box size for every brand logo
const LOGO_VERSION = "2"; // bust cache after logo swap

const BRANDS = [
  {
    name: "Rolex",
    slug: "rolex",
    logo: `/images/brands/rolex.png?v=${LOGO_VERSION}`,
  },
  {
    name: "Patex Philippe",
    slug: "patek-philippe",
    logo: `/images/brands/patek-philippe.png?v=${LOGO_VERSION}`,
  },
  {
    name: "Omega",
    slug: "omega",
    logo: `/images/brands/omega.png?v=${LOGO_VERSION}`,
  },
  {
    name: "Hublot",
    slug: "hublot",
    logo: `/images/brands/hublot.png?v=${LOGO_VERSION}`,
  },
  {
    name: "Cartier",
    slug: "cartier",
    logo: `/images/brands/cartier.png?v=${LOGO_VERSION}`,
  },
  {
    name: "Louis Vuitton",
    slug: "louis-vuitton",
    logo: `/images/brands/louis-vuitton.png?v=${LOGO_VERSION}`,
  },
];

export function BrandStrip() {
  return (
    <section className="py-10 border-b border-wf-border overflow-hidden bg-white">
      <div className="flex gap-10 md:gap-16 animate-scroll overflow-x-auto scrollbar-hide px-4 justify-center items-center">
        {BRANDS.map((brand) => (
          <Link
            key={brand.slug}
            href={`/watches/${brand.slug}`}
            className="shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300"
            aria-label={brand.name}
          >
            <span
              className="relative flex items-center justify-center bg-white"
              style={{ width: LOGO_BOX, height: LOGO_BOX }}
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                sizes={`${LOGO_BOX}px`}
                className="object-contain"
                unoptimized
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
