import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentCta,
  ContentPage,
  ContentSection,
} from "@/components/content/ContentPage";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "COSY AURA WATCH STORE — a curated destination for brand-new luxury watches with secure payment and delivery after confirmation.",
};

const VALUES = [
  {
    title: "New only",
    body: "We focus exclusively on brand-new luxury watches — never pre-owned.",
  },
  {
    title: "Curated selection",
    body: "Rolex, Patex Philippe, Omega, Hublot, Cartier, Louis Vuitton, and more — chosen for quality and desirability.",
  },
  {
    title: "Clear process",
    body: "Secure checkout, confirmation, then preparation and delivery. No surprises.",
  },
];

export default function AboutPage() {
  return (
    <ContentPage
      title="About Us"
      subtitle="COSY AURA WATCH STORE is built for buyers who want exceptional new luxury watches with a straightforward purchase experience."
    >
      <ContentSection title="Our story">
        <p>
          We set out to make buying a luxury watch simpler: a carefully selected
          catalogue, transparent pricing, and delivery that begins only after
          your payment is confirmed. Every piece we offer is new — ready for its
          first owner.
        </p>
        <p>
          From iconic Rolex sports models to Cartier dress watches and modern
          Hublot designs, our collection is curated for collectors and first-time
          luxury buyers alike.
        </p>
      </ContentSection>

      <ContentSection title="What we stand for">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 not-prose">
          {VALUES.map((v) => (
            <div key={v.title} className="border border-wf-border p-5">
              <h3 className="font-playfair text-lg text-wf-black mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-wf-gray leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Explore the collection">
        <p>
          Browse{" "}
          <Link href="/watches" className="text-gold hover:text-gold-light">
            all watches
          </Link>{" "}
          or jump to a brand from the navigation. Prefer to talk first?{" "}
          <Link href="/contact" className="text-gold hover:text-gold-light">
            Reach our team
          </Link>
          .
        </p>
      </ContentSection>

      <ContentCta />
    </ContentPage>
  );
}
