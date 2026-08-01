import type { Metadata } from "next";
import {
  ContentCta,
  ContentPage,
  ContentSection,
} from "@/components/content/ContentPage";

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "Learn how COSY AURA WATCH STORE prepares and delivers your luxury watch after payment confirmation.",
};

export default function ShippingPage() {
  return (
    <ContentPage
      title="Shipping"
      subtitle="Secure packaging and tracked delivery - your watch leaves our care only after payment is confirmed."
    >
      <ContentSection title="How shipping works">
        <p>
          Once your payment is confirmed, our team prepares your watch for
          dispatch. Each timepiece is packed in protective materials designed
          for luxury watches and sent with full tracking.
        </p>
        <p>
          Most orders ship within <strong className="text-wf-black">1–3 business days</strong>.
          Delivery estimates depend on your destination and the service selected
          at checkout.
        </p>
      </ContentSection>

      <ContentSection title="Delivery options">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-wf-black">Aramex</strong> - tracked courier
            service with discreet packaging.
          </li>
          <li>
            <strong className="text-wf-black">FedEx</strong> - insured domestic and
            international delivery.
          </li>
          <li>
            <strong className="text-wf-black">DHL Express</strong> - priority express
            with full tracking.
          </li>
        </ul>
        <p className="mt-4">
          Live carrier prices are calculated at checkout from your delivery address.
          Duties and taxes on international orders (if applicable) are the buyer’s
          responsibility unless stated otherwise.
        </p>
      </ContentSection>

      <ContentSection title="Packaging & security">
        <p>
          Watches are shipped in discreet outer packaging with no brand
          markings on the exterior. Signature may be required on delivery for
          high-value orders.
        </p>
      </ContentSection>

      <ContentSection title="Worldwide delivery">
        <p>
          We ship to all countries. Choose Aramex, FedEx, or DHL Express at
          checkout - live rates are calculated for your destination. Duties,
          taxes, and customs clearance (if applicable) are the responsibility of
          the buyer unless stated otherwise at checkout.
        </p>
      </ContentSection>

      <ContentCta label="Shop Watches" />
    </ContentPage>
  );
}
