import Image from "next/image";
import Link from "next/link";

const PROMOS = [
  {
    eyebrow: "New Arrivals",
    title: "Breitling Special Offers",
    cta: "Shop Breitling",
    href: "/watches/breitling",
    image:
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=1200&h=1200&fit=crop",
  },
  {
    eyebrow: "Mechanical Machines",
    title: "TAG Heuer Chronographs",
    cta: "Shop TAG Heuer",
    href: "/watches/tag-heuer",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&h=1200&fit=crop",
  },
];

export function PromoBanners() {
  return (
    <section className="px-4 pb-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROMOS.map((promo) => (
          <Link
            key={promo.href}
            href={promo.href}
            className="group relative aspect-square overflow-hidden bg-wf-black"
          >
            <Image
              src={promo.image}
              alt={promo.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center px-6 pb-10 md:pb-12">
              <p className="text-[11px] md:text-xs tracking-[0.28em] uppercase text-white/85 mb-2">
                {promo.eyebrow}
              </p>
              <h3 className="font-playfair text-2xl md:text-3xl text-white mb-5">
                {promo.title}
              </h3>
              <span className="inline-block bg-[#0b3d5c] text-white text-[11px] md:text-xs tracking-[0.18em] uppercase px-6 py-3 transition-colors group-hover:bg-[#0e4d73]">
                {promo.cta}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
