"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, currency } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-playfair text-3xl mb-4">Your Cart</h1>
        <p className="text-wf-gray mb-8">Your cart is empty.</p>
        <Link href="/watches" className="btn-gold">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.watchId} className="flex gap-6 p-4 border border-wf-border rounded-lg">
              <div className="relative w-24 h-24 rounded overflow-hidden shrink-0">
                <Image src={item.image} alt={item.model} fill className="object-cover" sizes="96px" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider font-semibold">{item.brand}</p>
                <Link href={`/watches/${item.slug}`} className="text-sm hover:text-gold">
                  {item.model}
                </Link>
                <p className="font-playfair text-gold mt-1">{formatPrice(item.price, currency)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateQuantity(item.watchId, item.quantity - 1)}
                    className="w-8 h-8 border border-wf-border rounded flex items-center justify-center hover:border-gold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.watchId, item.quantity + 1)}
                    className="w-8 h-8 border border-wf-border rounded flex items-center justify-center hover:border-gold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.watchId)}
                className="text-wf-gray hover:text-red-500 self-start"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="border border-wf-border rounded-lg p-6 h-fit">
          <h2 className="font-playfair text-xl mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-wf-gray">Subtotal</span>
              <span>{formatPrice(totalPrice(), currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wf-gray">Shipping</span>
              <span className="text-wf-gray">Calculated at checkout</span>
            </div>
          </div>
          <div className="flex justify-between font-playfair text-xl text-gold border-t border-wf-border pt-4 mb-6">
            <span>Total</span>
            <span>{formatPrice(totalPrice(), currency)}</span>
          </div>
          <Link href="/checkout" className="btn-gold w-full text-center block">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
