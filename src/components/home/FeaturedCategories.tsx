import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  {
    title: "Sport Watches",
    href: "/watches?category=Sport+Watches",
    image: "/images/watches/wristaficionado/nautilus/P4841S.jpg",
  },
  {
    title: "Dress Watches",
    href: "/watches?category=Dress+Watches",
    image: "/images/watches/rolex/428883.jpg",
  },
  {
    title: "Dive Watches",
    href: "/watches?category=Dive+Watches",
    image: "/images/watches/omega/417585.jpg",
  },
];

export function FeaturedCategories() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-playfair text-3xl text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative aspect-[3/2] overflow-hidden rounded-lg bg-wf-light"
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="font-playfair text-xl text-white">{cat.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
