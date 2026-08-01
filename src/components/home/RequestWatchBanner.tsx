import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RequestWatchBanner() {
  return (
    <section className="relative overflow-hidden bg-wf-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[280px] md:min-h-[320px]">
        {/* Copy + CTA */}
        <div className="relative z-10 flex flex-col justify-center px-6 py-12 md:px-10 lg:px-12">
          <p className="text-[11px] md:text-xs tracking-[0.35em] uppercase text-white/70 mb-3">
            Personal sourcing
          </p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.15] text-white mb-8 max-w-md">
            <span className="block font-normal tracking-wide text-white/90 text-2xl md:text-3xl mb-1">
              Request the watch
            </span>
            <span className="block">you&apos;ve been looking for.</span>
          </h2>

          <Link
            href="/contact?subject=Request%20a%20Watch"
            className="group inline-flex items-center justify-center gap-3 self-start bg-white text-wf-black px-7 py-3.5 text-xs tracking-[0.2em] uppercase font-medium hover:bg-gold hover:text-white transition-colors"
          >
            Request a Watch
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Visual */}
        <div className="relative min-h-[240px] lg:min-h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-wf-black via-wf-black/70 to-transparent z-[1] hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-wf-black/80 via-transparent to-transparent z-[1] lg:hidden" />
          <Image
            src="/images/watches/omega/417585.jpg"
            alt="Luxury watch"
            fill
            className="object-cover object-center scale-110 lg:scale-100 lg:object-left"
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-[#0a1628]/35 mix-blend-multiply" />
        </div>
      </div>
    </section>
  );
}
