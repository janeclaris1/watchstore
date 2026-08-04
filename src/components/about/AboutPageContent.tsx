import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Handshake, LayoutGrid, Brain, Compass } from "lucide-react";
import { prisma } from "@/lib/prisma";

const LOGO_VERSION = "3";

const HERO_BRANDS = [
  { name: "Rolex", slug: "rolex", logo: `/images/brands/rolex.png?v=${LOGO_VERSION}`, width: 72 },
  { name: "Omega", slug: "omega", logo: `/images/brands/omega.png?v=${LOGO_VERSION}`, width: 72 },
  { name: "Cartier", slug: "cartier", logo: `/images/brands/cartier.png?v=${LOGO_VERSION}`, width: 72 },
  { name: "IWC", slug: "iwc", logo: `/images/brands/iwc.svg?v=${LOGO_VERSION}`, width: 88 },
  { name: "Panerai", slug: "panerai", logo: `/images/brands/panerai.svg?v=${LOGO_VERSION}`, width: 100 },
  {
    name: "Vacheron Constantin",
    slug: "vacheron-constantin",
    logo: `/images/brands/vacheron-constantin.svg?v=${LOGO_VERSION}`,
    width: 120,
  },
];

const MEDIA = {
  hero: "/images/watches/watchesofswitzerland/vacheron-constantin/17510459/1.jpg",
  cardOne: "/images/watches/watchesofswitzerland/tissot/17361941/2.jpg",
  cardTwo: "/images/watches/watchesofswitzerland/timex/17160532/1.jpg",
  service: "/images/watches/jacob-co/18100312/1.jpg",
  returns: "/images/watches/watchesofswitzerland/vacheron-constantin/17510300/1.jpg",
  stats: "/images/watches/watchesofswitzerland/tissot/17361858/2.jpg",
};

const PILLARS = [
  {
    icon: Handshake,
    title: "Service",
    body: "Outstanding customer care is central to how we work. From first enquiry to delivery, our team guides you through a clear and secure purchase with support at every step.",
  },
  {
    icon: LayoutGrid,
    title: "Choice",
    body: "Explore a wide catalog of sport, dress, and dive watches across dozens of houses including Rolex, Omega, Cartier, Tissot, Jacob and Co, and Vacheron Constantin.",
  },
  {
    icon: Brain,
    title: "Knowledge",
    body: "We help you compare references, case sizes, and movements so you can choose with confidence whether this is your first luxury watch or your next collection piece.",
  },
  {
    icon: Compass,
    title: "Independence",
    body: "We are not tied to a single manufacturer. That gives you impartial guidance and the freedom to shop many brands in one place at transparent listed prices.",
  },
];

async function getAboutStats() {
  try {
    const [watchCount, brandCount] = await Promise.all([
      prisma.watch.count(),
      prisma.brand.count(),
    ]);
    return { watchCount, brandCount };
  } catch {
    return { watchCount: 0, brandCount: 0 };
  }
}

export async function AboutPageContent() {
  const { watchCount, brandCount } = await getAboutStats();
  const watchesLabel =
    watchCount >= 1000
      ? `${Math.floor(watchCount / 100) * 100}+`
      : watchCount > 0
        ? String(watchCount)
        : "500+";

  return (
    <div className="bg-white font-cantora">
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center text-white overflow-hidden">
        <Image
          src={MEDIA.hero}
          alt="Detailed luxury watch dial photographed in studio lighting"
          fill
          priority
          className="object-cover object-center grayscale"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" aria-hidden />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-6">
            COSY AURA WATCH STORE
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] leading-snug md:leading-tight tracking-tight">
            Global luxury watch selection, trusted support, and secure checkout
            come together to help you find your next watch.
          </h1>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16 md:pb-20 mt-auto">
          <p className="text-xs sm:text-sm text-white/80 mb-8 max-w-2xl mx-auto">
            Brands we carry include
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-90">
            {HERO_BRANDS.map((brand) => (
              <Link
                key={brand.name}
                href={`/watches/${brand.slug}`}
                className="hover:opacity-100 opacity-80 transition-opacity"
                aria-label={brand.name}
              >
                <Image
                  src={brand.logo}
                  alt=""
                  width={brand.width}
                  height={40}
                  className="h-8 md:h-10 w-auto brightness-0 invert object-contain"
                />
              </Link>
            ))}
          </div>
        </div>

        <a
          href="#welcome"
          className="relative z-10 pb-8 text-white/70 hover:text-white transition-colors"
          aria-label="Scroll to learn more"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </a>
      </section>

      <section id="welcome" className="max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-wf-black mb-8">
          Welcome To COSY AURA
        </h2>
        <p className="text-wf-gray text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-14 md:mb-20">
          COSY AURA WATCH STORE is a curated destination for brand new luxury
          watches. With hundreds of references across {brandCount || "15"}+ brands
          including Rolex, Omega, Cartier, Hublot, Tissot, and Vacheron
          Constantin, plus secure checkout and worldwide delivery after payment
          confirmation, this is a reliable place to discover your next timepiece.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 text-left">
          <div>
            <div className="relative aspect-[4/3] bg-wf-light overflow-hidden mb-4">
              <Image
                src={MEDIA.cardOne}
                alt="Close-up of a premium steel sports watch bracelet and dial"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <h3 className="text-xl font-bold text-wf-black">Curated Inventory</h3>
          </div>
          <div>
            <div className="relative aspect-[4/3] bg-wf-light overflow-hidden mb-4">
              <Image
                src={MEDIA.cardTwo}
                alt="Watch shown in a lifestyle setup for digital shopping"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <h3 className="text-xl font-bold text-wf-black">Transparent Value</h3>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          <div>
            <div className="relative aspect-[4/3] bg-wf-light overflow-hidden mb-5">
              <Image
                src={MEDIA.service}
                alt="High-end watch photographed to show movement and finishing"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <h3 className="text-xl font-bold text-wf-black mb-3">Secure Fulfillment</h3>
            <p className="text-wf-gray text-[15px] leading-relaxed">
              Every order is prepared only after payment is confirmed. Watches are
              checked, packed with care, and dispatched with tracked international
              shipping via Aramex, FedEx, or DHL Express so you always know where
              your piece is from checkout to delivery.
            </p>
          </div>
          <div>
            <div className="relative aspect-[4/3] bg-wf-light overflow-hidden mb-5">
              <Image
                src={MEDIA.returns}
                alt="Premium watch and packaging to represent protected delivery"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <h3 className="text-xl font-bold text-wf-black mb-3">14-Day Returns</h3>
            <p className="text-wf-gray text-[15px] leading-relaxed">
              Buying a luxury watch online should feel straightforward. With 14
              days to change your mind, you can shop with confidence. If needed,
              return your watch unused in original packaging for a full refund.
            </p>
          </div>
        </div>
      </section>

      <section className="relative min-h-[420px] md:min-h-[480px] flex items-stretch overflow-hidden">
        <Image
          src={MEDIA.stats}
          alt="Luxury watch collection highlighting variety in stock"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="relative z-10 flex items-center">
          <div className="bg-white/95 backdrop-blur-sm px-8 py-10 md:px-12 md:py-14 min-w-[240px] md:min-w-[280px] shadow-lg">
            <ul className="space-y-8">
              <li>
                <p className="text-3xl md:text-4xl font-bold text-gold tabular-nums">2024</p>
                <p className="text-sm text-wf-gray mt-1">Store founded</p>
              </li>
              <li>
                <p className="text-3xl md:text-4xl font-bold text-gold tabular-nums">
                  {watchesLabel}
                </p>
                <p className="text-sm text-wf-gray mt-1">Watches available now</p>
              </li>
              <li>
                <p className="text-3xl md:text-4xl font-bold text-gold tabular-nums">
                  {brandCount || "15"}+
                </p>
                <p className="text-sm text-wf-gray mt-1">Luxury brands</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-14">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="w-8 h-8 text-gold mb-4 stroke-[1.5]" aria-hidden />
              <h3 className="text-xl font-bold text-wf-black mb-3">{title}</h3>
              <p className="text-wf-gray text-[15px] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-wf-border bg-wf-light">
        <div className="max-w-5xl mx-auto px-6 py-14 md:py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl text-wf-black mb-2">Find your next watch</h2>
            <p className="text-sm text-wf-gray">
              Browse the full catalog or speak with our team first.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link href="/watches" className="btn-gold">
              Browse Watches
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
