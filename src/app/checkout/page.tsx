"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, currency, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    postcode: "",
    country: "GB",
    createAccount: false,
  });

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-playfair text-3xl mb-4">Checkout</h1>
        <p className="text-wf-gray mb-8">Your cart is empty.</p>
        <Link href="/watches" className="btn-gold">Continue Shopping</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

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
          email: form.email,
          shipping: {
            name: form.name,
            address: form.address,
            city: form.city,
            postcode: form.postcode,
            country: form.country,
          },
          createAccount: form.createAccount,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed. Please try again.");
      }
    } catch {
      alert("Checkout failed. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold mb-4">Contact Information</h2>
            <input
              type="email"
              placeholder="Email address"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border border-wf-border rounded text-sm focus:outline-none focus:border-gold mb-3"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.createAccount}
                onChange={(e) => setForm({ ...form, createAccount: e.target.checked })}
                className="rounded text-gold focus:ring-gold"
              />
              Create an account for faster checkout next time
            </label>
          </div>

          <div>
            <h2 className="font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-wf-border rounded text-sm focus:outline-none focus:border-gold"
              />
              <input
                type="text"
                placeholder="Address"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 border border-wf-border rounded text-sm focus:outline-none focus:border-gold"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 border border-wf-border rounded text-sm focus:outline-none focus:border-gold"
                />
                <input
                  type="text"
                  placeholder="Postcode"
                  required
                  value={form.postcode}
                  onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                  className="w-full px-4 py-3 border border-wf-border rounded text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-4 py-3 border border-wf-border rounded text-sm focus:outline-none focus:border-gold bg-white"
              >
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border border-wf-border rounded-lg p-6 h-fit">
          <h2 className="font-playfair text-xl mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.watchId} className="flex justify-between text-sm">
                <span className="text-wf-gray">
                  {item.brand} {item.model} x{item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity, currency)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-wf-border pt-4 mb-6">
            <div className="flex justify-between font-playfair text-xl text-gold">
              <span>Total</span>
              <span>{formatPrice(totalPrice(), currency)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay with Stripe"}
          </button>
          <p className="text-xs text-wf-gray text-center mt-4">
            Secure payment powered by Stripe
          </p>
        </div>
      </form>
    </div>
  );
}
