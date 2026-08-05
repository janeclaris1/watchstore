import type { Metadata } from "next";
import {
  ContentCta,
  ContentPage,
  ContentSection,
} from "@/components/content/ContentPage";
import { getActiveShippingMethods } from "@/lib/shipping-methods";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "Learn how COSY AURA WATCH STORE prepares and delivers your luxury watch after payment confirmation.",
};

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const methods = await getActiveShippingMethods();

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
          {methods.map((method) => (
            <li key={method.id}>
              <strong className="text-wf-black">{method.name}</strong> —{" "}
              {formatPrice(method.price)} · {method.eta}
              {method.description ? `. ${method.description}` : ""}
            </li>
          ))}
        </ul>
        <p className="mt-4">
          Shipping is selected at checkout. Duties and taxes on international
          orders (if applicable) are the buyer’s responsibility unless stated
          otherwise.
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
          We ship worldwide. Choose your delivery option at checkout — rates and
          timing are shown before you pay. Duties, taxes, and customs clearance
          (if applicable) are the responsibility of the buyer unless stated
          otherwise at checkout.
        </p>
      </ContentSection>

      <ContentCta label="Shop Watches" />
    </ContentPage>
  );
}
