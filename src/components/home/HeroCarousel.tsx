"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1920&h=800&fit=crop",
    title: "Discover the World's Finest Watches",
    subtitle: "Brand-new luxury watches, delivered after payment",
  },
  {
    image: "https://images.unsplash.com/photo-1547996160-81dfa630bf49?w=1920&h=800&fit=crop",
    title: "Iconic Timepieces, Expertly Curated",
    subtitle: "Secure checkout and fast delivery after payment confirmation",
  },
  {
    image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=1920&h=800&fit=crop",
    title: "From Rolex to Louis Vuitton",
    subtitle: "A curated selection of premium new watches",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-playfair text-3xl md:text-5xl text-white mb-4 max-w-3xl animate-fade-up">
          {SLIDES[current].title}
        </h1>
        <p className="text-white/80 text-lg mb-8 max-w-xl">
          {SLIDES[current].subtitle}
        </p>
        <Link href="/watches" className="btn-gold text-base px-8 py-3.5">
          Browse Collection
        </Link>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current ? "bg-gold w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
