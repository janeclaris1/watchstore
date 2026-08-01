"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import type { LiveShippingRate } from "@/lib/shipping";
import { COUNTRIES } from "@/lib/countries";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, currency } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [rates, setRates] = useState<LiveShippingRate[]>([]);
  const [ratesSource, setRatesSource] = useState<"easypost" | "fallback" | null>(null);
  const [ratesWarning, setRatesWarning] = useState<string | undefined>();
  const [selectedRateId, setSelectedRateId] = useState<string>("");
  const [form, setForm] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "US",
    createAccount: false,
  });

  const selectedRate = useMemo(
    () => rates.find((rate) => rate.id === selectedRateId) || rates[0],
    [rates, selectedRateId]
  );

  const subtotal = totalPrice();
  const shippingCost = selectedRate?.price ?? 0;
  const orderTotal = subtotal + shippingCost;

  const addressReady =
    Boolean(form.address.trim()) &&
    Boolean(form.city.trim()) &&
    Boolean(form.postcode.trim()) &&
    Boolean(form.country);

  const loadRates = useCallback(async () => {
    if (!addressReady) {
      setRates([]);
      setSelectedRateId("");
      setRatesSource(null);
      setRatesWarning(undefined);
      return;
    }

    setRatesLoading(true);
    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email || undefined,
          address: {
            name: form.name,
            street1: form.address,
            city: form.city,
            state: form.state,
            postcode: form.postcode,
            country: form.country,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load rates");
      }
      const nextRates = (data.rates || []) as LiveShippingRate[];
      setRates(nextRates);
      setRatesSource(data.source);
      setRatesWarning(data.warning);
      setSelectedRateId((prev) =>
        nextRates.some((rate) => rate.id === prev) ? prev : nextRates[0]?.id || ""
      );
    } catch (error) {
      console.error(error);
      setRates([]);
      setRatesWarning("Could not load live shipping rates. Please try again.");
    } finally {
      setRatesLoading(false);
    }
  }, [addressReady, form.address, form.city, form.country, form.email, form.name, form.postcode, form.state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRates();
    }, 450);
    return () => clearTimeout(timer);
  }, [loadRates]);

  if (items.length === 0) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRate) {
      alert("Please wait for shipping rates, then choose a courier.");
      return;
    }

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
            state: form.state,
            postcode: form.postcode,
            country: form.country,
            rateId: selectedRate.id,
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
                  placeholder="State / Province"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-4 py-3 border border-wf-border rounded text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Postcode"
                  required
                  value={form.postcode}
                  onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                  className="w-full px-4 py-3 border border-wf-border rounded text-sm focus:outline-none focus:border-gold"
                />
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-3 border border-wf-border rounded text-sm focus:outline-none focus:border-gold bg-white"
                  required
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold">Shipping Method</h2>
              {ratesSource === "easypost" && (
                <span className="text-xs text-green-700">Live carrier rates</span>
              )}
              {ratesSource === "fallback" && (
                <span className="text-xs text-amber-700">Estimated rates</span>
              )}
            </div>

            {!addressReady && (
              <p className="text-sm text-wf-gray">
                Enter your shipping address to see Aramex, FedEx, and DHL prices.
              </p>
            )}

            {addressReady && ratesLoading && (
              <p className="text-sm text-wf-gray">Fetching live rates…</p>
            )}

            {addressReady && !ratesLoading && rates.length === 0 && (
              <p className="text-sm text-red-600">
                {ratesWarning || "No shipping rates available for this address."}
              </p>
            )}

            <div className="space-y-3">
              {rates.map((method) => {
                const selected = selectedRate?.id === method.id;
                return (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      selected
                        ? "border-gold bg-gold/5"
                        : "border-wf-border hover:border-gold/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.id}
                      checked={selected}
                      onChange={() => setSelectedRateId(method.id)}
                      className="mt-1 text-gold focus:ring-gold"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-medium text-sm">{method.name}</span>
                        <span className="text-sm font-medium shrink-0">
                          {formatPrice(method.price, currency)}
                        </span>
                      </span>
                      <span className="block text-xs text-wf-gray mt-1">
                        {method.description} · {method.eta}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            {ratesWarning && ratesSource === "fallback" && (
              <p className="text-xs text-amber-700 mt-3">{ratesWarning}</p>
            )}
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
          <div className="space-y-2 text-sm border-t border-wf-border pt-4 mb-4">
            <div className="flex justify-between">
              <span className="text-wf-gray">Subtotal</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wf-gray">
                Shipping{selectedRate ? ` (${selectedRate.name})` : ""}
              </span>
              <span>
                {!selectedRate
                  ? "-"
                  : formatPrice(shippingCost, currency)}
              </span>
            </div>
          </div>
          <div className="border-t border-wf-border pt-4 mb-6">
            <div className="flex justify-between font-playfair text-xl text-gold">
              <span>Total</span>
              <span>{formatPrice(orderTotal, currency)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !selectedRate || ratesLoading}
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
