"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

interface WishlistWatch {
  id: string;
  slug: string;
  model: string;
  price: number;
  brand: { name: string };
  images: { url: string }[];
}

export default function WishlistPage() {
  const wishlistIds = useWishlistStore((s) => s.items);
  const [watches, setWatches] = useState<WishlistWatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setLoading(false);
      return;
    }

    fetch(`/api/watches?ids=${wishlistIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        setWatches(data.watches || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-wf-gray">Loading wishlist...</p>
      </div>
    );
  }

  if (watches.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart className="w-12 h-12 text-wf-gray mx-auto mb-4" />
        <h1 className="font-playfair text-3xl mb-4">Your Wishlist</h1>
        <p className="text-wf-gray mb-8">Save watches you love by clicking the heart icon.</p>
        <Link href="/watches" className="btn-gold">Browse Watches</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl mb-8">Your Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {watches.map((watch) => (
          <Link key={watch.id} href={`/watches/${watch.slug}`} className="group">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-wf-light mb-3">
              <Image
                src={watch.images[0]?.url || "/images/placeholders/watch.svg"}
                alt={watch.model}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold">{watch.brand.name}</p>
            <p className="text-sm text-wf-gray">{watch.model}</p>
            <p className="font-playfair text-xl text-gold mt-1">{formatPrice(watch.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
