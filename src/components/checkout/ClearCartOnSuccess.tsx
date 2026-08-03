"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store";

/** Clears the cart after a successful embedded (or hosted) Checkout return. */
export function ClearCartOnSuccess() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
