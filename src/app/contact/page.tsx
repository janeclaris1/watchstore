import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ContactForm } from "@/components/content/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with COSY AURA WATCH STORE for product questions, orders, and support.",
};

export default function ContactPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-wf-border bg-gradient-to-br from-wf-light via-white to-[#f3eee4]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(184,134,11,0.18) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4 animate-fade-up">
            COSY AURA WATCH STORE
          </p>
          <h1 className="font-playfair text-4xl md:text-6xl text-wf-black mb-5 max-w-3xl animate-fade-up [animation-delay:80ms]">
            Contact
          </h1>
          <p className="text-wf-gray text-base md:text-lg leading-relaxed max-w-xl animate-fade-up [animation-delay:160ms]">
            Questions about a watch, your order, or aftercare? Write to us - our
            team replies with care.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <aside className="lg:col-span-4 space-y-10 animate-fade-up">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-wf-gray mb-3">
                Email
              </p>
              <a
                href="mailto:support@cosyaurawatchstore.com"
                className="font-playfair text-2xl text-wf-black hover:text-gold transition-colors break-all"
              >
                support@cosyaurawatchstore.com
              </a>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-wf-gray mb-3">
                Hours
              </p>
              <p className="text-wf-black leading-relaxed">
                Monday – Friday
                <br />
                <span className="text-wf-gray">9:00 AM – 6:00 PM</span>
              </p>
            </div>

            <div className="border-t border-wf-border pt-8">
              <p className="text-sm text-wf-gray leading-relaxed">
                For order updates, include your order number. We aim to reply
                within one business day.
              </p>
              <Link
                href="/faq"
                className="inline-block mt-4 text-sm text-wf-black border-b border-gold pb-0.5 hover:text-gold transition-colors"
              >
                Browse FAQ
              </Link>
            </div>
          </aside>

          <div className="lg:col-span-8 lg:border-l lg:border-wf-border lg:pl-16">
            <h2 className="font-playfair text-3xl text-wf-black mb-2 animate-fade-up">
              Send a message
            </h2>
            <p className="text-sm text-wf-gray mb-10 animate-fade-up [animation-delay:80ms]">
              Tell us what you need - product details, shipping, or returns.
            </p>
            <Suspense fallback={<p className="text-sm text-wf-gray">Loading form…</p>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
