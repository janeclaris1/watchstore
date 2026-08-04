"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { StripeEmbeddedCheckout } from "@/components/checkout/StripeEmbeddedCheckout";

export default function CheckoutPage() {
  const { items, totalPrice, currency, clearCart } = useCartStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const subtotal = totalPrice();

  const cartKey = items.map((i) => `${i.watchId}:${i.quantity}:${i.price}`).join("|");

  const startCheckout = useCallback(async () => {
    if (items.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            watchId: i.watchId,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || "Could not start checkout");
      }
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
    // cartKey captures item identity; items read from closure on each key change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey]);

  useEffect(() => {
    void startCheckout();
  }, [startCheckout]);

  if (items.length === 0 && !clientSecret) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-playfair text-3xl mb-4">Checkout</h1>
        <p className="text-wf-gray mb-8">Your cart is empty.</p>
        <Link href="/watches" className="btn-gold">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-2">
      {/* Left: order summary — mirrors Stripe hosted Checkout summary pane */}
      <aside className="bg-[#0a2540] text-white order-2 lg:order-1">
        <div className="max-w-lg mx-auto lg:ml-auto lg:mr-0 px-6 py-8 lg:py-12 lg:pr-12 lg:pl-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            COSY AURA WATCH STORE
          </Link>

          <p className="text-sm text-white/60 mb-1">Pay COSY AURA</p>
          <p className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
            {formatPrice(subtotal, currency)}
            <span className="block text-sm font-normal text-white/50 mt-1">
              + shipping at next step
            </span>
          </p>

          <ul className="space-y-5">
            {items.map((item) => (
              <li key={item.watchId} className="flex gap-4">
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-white/10 shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={`${item.brand} ${item.model}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : null}
                  {item.quantity > 1 && (
                    <span className="absolute -top-1 -right-1 bg-white text-[#0a2540] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.brand} {item.model}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-medium shrink-0">
                  {formatPrice(item.price * item.quantity, currency)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-white/15 space-y-2 text-sm">
            <div className="flex justify-between text-white/70">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Shipping</span>
              <span>Calculated in form</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2">
              <span>Total due</span>
              <span>{formatPrice(subtotal, currency)}+</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Right: full Stripe Checkout embed (email, address, shipping, pay) */}
      <section className="bg-white order-1 lg:order-2">
        <div className="max-w-lg mx-auto lg:mr-auto lg:ml-0 px-4 sm:px-6 py-8 lg:py-12 lg:pl-12 lg:pr-8">
          <p className="text-xs text-wf-gray mb-4">
            You will be asked to accept our terms at the final payment step before
            your order is submitted.
          </p>

          {loading && (
            <p className="text-sm text-wf-gray py-20 text-center">
              Loading secure checkout…
            </p>
          )}

          {error && (
            <div className="py-12 text-center space-y-4">
              <p className="text-sm text-red-600">{error}</p>
              <button type="button" className="btn-gold" onClick={() => void startCheckout()}>
                Try again
              </button>
              <button
                type="button"
                className="block mx-auto text-sm text-wf-gray"
                onClick={() => clearCart()}
              >
                Clear cart
              </button>
            </div>
          )}

          {!loading && !error && clientSecret && (
            <StripeEmbeddedCheckout clientSecret={clientSecret} />
          )}
        </div>
      </section>
    </div>
  );
}
