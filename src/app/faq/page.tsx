import type { Metadata } from "next";
import {
  ContentCta,
  ContentPage,
  ContentSection,
} from "@/components/content/ContentPage";
import { FaqAccordion } from "@/components/content/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about ordering, shipping, returns, and warranty at COSY AURA WATCH STORE.",
};

const FAQS = [
  {
    question: "Are your watches brand new?",
    answer:
      "Yes. Every watch we sell is brand new and sourced through trusted supply channels. We do not sell pre-owned timepieces.",
  },
  {
    question: "When will my watch ship?",
    answer:
      "Your order is prepared after payment confirmation. Most orders dispatch within 1–3 business days, with express delivery options available at checkout.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept major credit and debit cards via Stripe secure checkout, including Visa, Mastercard, and American Express.",
  },
  {
    question: "Do you offer a warranty?",
    answer:
      "Yes. Every purchase includes our 12-month store warranty covering manufacturing defects under normal use. Full terms are on our Warranty page.",
  },
  {
    question: "What is your returns policy?",
    answer:
      "You may return an eligible watch within 14 days of delivery for a full refund, provided it is unused and in original packaging. See our Returns page for details.",
  },
  {
    question: "Can I reserve a watch?",
    answer:
      "Watches are sold on a first-come, first-served basis. Adding an item to your cart does not reserve it — complete checkout to secure your purchase.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "We currently focus on domestic delivery with select international destinations. Shipping options and estimated times appear at checkout.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Once your watch ships, you will receive a confirmation email with tracking details. You can also contact support with your order number.",
  },
];

export default function FaqPage() {
  return (
    <ContentPage
      title="Frequently Asked Questions"
      subtitle="Quick answers about shopping, delivery, returns, and care for your new luxury watch."
    >
      <ContentSection>
        <FaqAccordion items={FAQS} />
      </ContentSection>
      <p className="text-sm text-wf-gray mt-8">
        Still need help?{" "}
        <a href="/contact" className="text-gold hover:text-gold-light">
          Contact our team
        </a>
        .
      </p>
      <ContentCta />
    </ContentPage>
  );
}
