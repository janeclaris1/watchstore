"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const STORAGE_KEY = "ca-newsletter-popup-dismissed";
const SHOW_DELAY_MS = 3500;

const SHOWCASE = [
  {
    src: "/images/watches/rolex/126233-2020.jpg",
    alt: "Rolex",
    className: "left-6 top-10 w-[42%] rotate-[-8deg]",
  },
  {
    src: "/images/watches/omega/404511.jpg",
    alt: "Omega",
    className: "right-5 top-1/2 -translate-y-1/2 w-[48%] rotate-[6deg] z-10",
  },
  {
    src: "/images/watches/breitling/414402.jpg",
    alt: "Breitling",
    className: "bottom-8 left-1/4 w-[40%] rotate-[-3deg]",
  },
];

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // ignore
    }

    const timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName: firstName.trim() || undefined }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      window.setTimeout(dismiss, 1400);
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-wf-black/55 backdrop-blur-[2px]"
        aria-label="Close newsletter popup"
        onClick={dismiss}
      />

      <div className="relative w-full max-w-[860px] overflow-hidden bg-white shadow-2xl animate-fade-up grid grid-cols-1 md:grid-cols-2">
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/95 border border-wf-border flex items-center justify-center text-wf-black hover:bg-wf-light transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Form panel */}
        <div className="relative z-10 flex flex-col justify-center px-8 py-10 md:px-10 md:py-12">
          <BrandLogo size="sm" className="mb-7" />

          <p className="text-[11px] tracking-[0.28em] uppercase text-gold mb-3">
            Private list
          </p>
          <h2
            id="newsletter-popup-title"
            className="font-playfair text-3xl md:text-[2.35rem] leading-tight text-wf-black mb-3"
          >
            Join our Email List
          </h2>
          <p className="font-playfair text-base text-wf-black/80 mb-7 max-w-sm">
            Unlock 5% off your first order, plus early access to new arrivals.
          </p>

          {status === "success" ? (
            <p className="text-sm text-green-700 font-medium">
              You&apos;re in. Welcome to Cosy Aura.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="firstName"
                autoComplete="given-name"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-wf-border bg-white text-sm text-wf-black placeholder:text-wf-gray/70 focus:outline-none focus:border-gold"
              />
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-wf-border bg-white text-sm text-wf-black placeholder:text-wf-gray/70 focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-wf-black text-white text-xs tracking-[0.22em] uppercase py-3.5 hover:bg-gold transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "Joining..." : "Join Now"}
              </button>
              {status === "error" && (
                <p className="text-sm text-red-500">
                  Something went wrong. Please try again.
                </p>
              )}
              <p className="text-[11px] text-wf-gray leading-relaxed pt-1">
                By joining, you agree to receive emails from Cosy Aura Watch Store.
                Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>

        {/* Visual panel */}
        <div className="relative hidden md:block min-h-[420px] bg-[#141414] overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(184,134,11,0.9) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gold/20" />

          {SHOWCASE.map((item) => (
            <div
              key={item.src}
              className={`absolute aspect-square bg-white/95 shadow-xl overflow-hidden ${item.className}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-contain p-2"
                sizes="200px"
                unoptimized
              />
            </div>
          ))}

          <div className="absolute bottom-5 left-0 right-0 text-center">
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/70">
              New luxury watches
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
