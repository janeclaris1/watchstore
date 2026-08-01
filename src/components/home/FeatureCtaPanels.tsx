import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const PANELS = [
  {
    title: "Buy with Confidence",
    body: "We curate brand-new luxury watches from trusted channels - verified, ready to ship after payment.",
    href: "/watches",
    image: "/images/watches/rolex/126233-2020.jpg",
    imageAlt: "Luxury chronograph watch",
  },
  {
    title: "Request a Watch",
    body: "Looking for a specific reference? Tell us what you want and our team will help you source it.",
    href: "/contact?subject=Request%20a%20Watch",
    image: "/images/watches/omega/417585.jpg",
    imageAlt: "Watch specialist inspection",
  },
];

export function FeatureCtaPanels() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      {PANELS.map((panel) => (
        <Link
          key={panel.href}
          href={panel.href}
          className="group grid grid-cols-2 bg-wf-light overflow-hidden min-h-[160px] md:min-h-[180px]"
        >
          <div className="relative bg-white flex items-center justify-center p-3 sm:p-4">
            <Image
              src={panel.image}
              alt={panel.imageAlt}
              fill
              className="object-contain p-2 sm:p-3 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
              unoptimized
            />
          </div>

          <div className="relative flex flex-col justify-center px-4 py-5 sm:px-6 sm:py-6 pr-10 sm:pr-12">
            <h3 className="text-[13px] sm:text-sm font-semibold tracking-[0.06em] uppercase text-wf-black mb-2 leading-snug">
              {panel.title}
            </h3>
            <p className="text-xs sm:text-[13px] text-wf-gray leading-relaxed">
              {panel.body}
            </p>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wf-gray group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>
      ))}
    </div>
  );
}
