"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice, cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, currency } =
    useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-wf-border">
          <h2 className="font-playfair text-xl">Shopping Bag</h2>
          <button onClick={closeCart} className="p-1 hover:text-gold transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingBag className="w-12 h-12 text-wf-gray mb-4" />
            <p className="text-wf-gray mb-4">Your bag is empty</p>
            <button onClick={closeCart} className="btn-gold">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.map((item) => (
                <div key={item.watchId} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.model}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider font-semibold">
                      {item.brand}
                    </p>
                    <p className="text-sm text-wf-gray truncate">{item.model}</p>
                    <p className="font-playfair text-gold mt-1">
                      {formatPrice(item.price, currency)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.watchId, item.quantity - 1)}
                        className="w-7 h-7 border border-wf-border rounded flex items-center justify-center hover:border-gold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.watchId, item.quantity + 1)}
                        className="w-7 h-7 border border-wf-border rounded flex items-center justify-center hover:border-gold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.watchId)}
                        className="text-xs text-wf-gray hover:text-red-500 ml-auto"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-wf-border p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-wf-gray">Subtotal</span>
                <span className="font-playfair text-xl text-gold">
                  {formatPrice(totalPrice(), currency)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-gold w-full text-center block"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="btn-outline w-full text-center block text-sm"
              >
                View Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
