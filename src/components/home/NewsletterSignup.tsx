"use client";

import { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="py-16 px-4 bg-wf-light">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-playfair text-3xl mb-3">Stay Ahead of the Curve</h2>
        <p className="text-wf-gray mb-8">
          Be the first to know about new arrivals, exclusive offers, and watch market insights.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 border border-wf-border rounded bg-white text-sm focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-gold shrink-0 disabled:opacity-50"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {status === "success" && (
          <p className="text-sm text-green-600 mt-3">Thank you for subscribing!</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-500 mt-3">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  );
}
