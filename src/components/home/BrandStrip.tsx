import Image from "next/image";
import Link from "next/link";

const LOGO_HEIGHT = 56;
const LOGO_VERSION = "3";

const BRANDS = [
  {
    name: "Rolex",
    slug: "rolex",
    logo: `/images/brands/rolex.png?v=${LOGO_VERSION}`,
    width: 56,
  },
  {
    name: "Patex Philippe",
    slug: "patek-philippe",
    logo: `/images/brands/patek-philippe.png?v=${LOGO_VERSION}`,
    width: 56,
  },
  {
    name: "Omega",
    slug: "omega",
    logo: `/images/brands/omega.png?v=${LOGO_VERSION}`,
    width: 56,
  },
  {
    name: "Hublot",
    slug: "hublot",
    logo: `/images/brands/hublot.png?v=${LOGO_VERSION}`,
    width: 56,
  },
  {
    name: "Cartier",
    slug: "cartier",
    logo: `/images/brands/cartier.png?v=${LOGO_VERSION}`,
    width: 56,
  },
  {
    name: "Louis Vuitton",
    slug: "louis-vuitton",
    logo: `/images/brands/louis-vuitton.png?v=${LOGO_VERSION}`,
    width: 56,
  },
  {
    name: "Breitling",
    slug: "breitling",
    logo: `/images/brands/breitling.svg?v=${LOGO_VERSION}`,
    width: 140,
  },
  {
    name: "Tudor",
    slug: "tudor",
    logo: `/images/brands/tudor.svg?v=${LOGO_VERSION}`,
    width: 110,
  },
  {
    name: "IWC",
    slug: "iwc",
    logo: `/images/brands/iwc.svg?v=${LOGO_VERSION}`,
    width: 80,
  },
  {
    name: "Panerai",
    slug: "panerai",
    logo: `/images/brands/panerai.svg?v=${LOGO_VERSION}`,
    width: 120,
  },
  {
    name: "Bremont",
    slug: "bremont",
    logo: `/images/brands/bremont.svg?v=${LOGO_VERSION}`,
    width: 120,
  },
  {
    name: "Grand Seiko",
    slug: "grand-seiko",
    logo: `/images/brands/grand-seiko.svg?v=${LOGO_VERSION}`,
    width: 150,
  },
  {
    name: "TAG Heuer",
    slug: "tag-heuer",
    logo: `/images/brands/tag-heuer.svg?v=${LOGO_VERSION}`,
    width: 130,
  },
  {
    name: "Jacob & Co",
    slug: "jacob-co",
    logo: `/images/brands/jacob-co.svg?v=${LOGO_VERSION}`,
    width: 140,
  },
  {
    name: "Tissot",
    slug: "tissot",
    logo: `/images/brands/tissot.svg?v=${LOGO_VERSION}`,
    width: 110,
  },
  {
    name: "Timex",
    slug: "timex",
    logo: `/images/brands/timex.svg?v=${LOGO_VERSION}`,
    width: 110,
  },
  {
    name: "Vacheron Constantin",
    slug: "vacheron-constantin",
    logo: `/images/brands/vacheron-constantin.svg?v=${LOGO_VERSION}`,
    width: 180,
  },
];

function BrandLogo({
  brand,
  duplicate,
}: {
  brand: (typeof BRANDS)[number];
  duplicate?: boolean;
}) {
  return (
    <Link
      href={`/watches/${brand.slug}`}
      className="shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300"
      aria-label={brand.name}
      tabIndex={duplicate ? -1 : undefined}
      aria-hidden={duplicate || undefined}
    >
      <span
        className="relative flex items-center justify-center bg-white"
        style={{ width: brand.width, height: LOGO_HEIGHT }}
      >
        <Image
          src={brand.logo}
          alt={duplicate ? "" : brand.name}
          fill
          sizes={`${brand.width}px`}
          className="object-contain"
          unoptimized
        />
      </span>
    </Link>
  );
}

export function BrandStrip() {
  return (
    <section className="py-10 border-b border-wf-border overflow-hidden bg-white">
      <div className="w-full overflow-hidden">
        <div className="brand-marquee">
          {BRANDS.map((brand) => (
            <BrandLogo key={brand.slug} brand={brand} />
          ))}
          {BRANDS.map((brand) => (
            <BrandLogo key={`dup-${brand.slug}`} brand={brand} duplicate />
          ))}
        </div>
      </div>
    </section>
  );
}
