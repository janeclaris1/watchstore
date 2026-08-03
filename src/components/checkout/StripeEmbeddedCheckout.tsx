"use client";

import { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

export function StripeEmbeddedCheckout({
  clientSecret,
}: {
  clientSecret: string;
}) {
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    []
  );

  if (!publishableKey) {
    return (
      <p className="text-sm text-red-600">
        Stripe publishable key is missing. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        in your environment.
      </p>
    );
  }

  return (
    <div id="stripe-embedded-checkout" className="min-h-[420px]">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
