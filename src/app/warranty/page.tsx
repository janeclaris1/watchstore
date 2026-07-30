import type { Metadata } from "next";
import {
  ContentCta,
  ContentPage,
  ContentSection,
} from "@/components/content/ContentPage";

export const metadata: Metadata = {
  title: "Warranty",
  description:
    "12-month store warranty details for watches purchased from COSY AURA WATCH STORE.",
};

export default function WarrantyPage() {
  return (
    <ContentPage
      title="Warranty"
      subtitle="Every watch includes our 12-month store warranty for manufacturing defects under normal use."
    >
      <ContentSection title="Coverage">
        <p>
          Your purchase is protected by a{" "}
          <strong className="text-wf-black">12-month store warranty</strong>{" "}
          starting from the delivery date. It covers manufacturing defects in
          materials and workmanship when the watch is used as intended.
        </p>
      </ContentSection>

      <ContentSection title="What is covered">
        <ul className="list-disc pl-5 space-y-2">
          <li>Movement or mechanical faults due to manufacturing defect</li>
          <li>Dial, hands, or case defects present from manufacture</li>
          <li>Issues arising under normal wear within the warranty period</li>
        </ul>
      </ContentSection>

      <ContentSection title="What is not covered">
        <ul className="list-disc pl-5 space-y-2">
          <li>Damage from accidents, impact, or improper handling</li>
          <li>Water damage when water resistance limits are exceeded</li>
          <li>Normal wear on straps, clasps, or polishing marks</li>
          <li>Unauthorized repairs or modifications</li>
          <li>Loss, theft, or cosmetic preference changes</li>
        </ul>
      </ContentSection>

      <ContentSection title="How to make a claim">
        <p>
          Contact our team with your order number, a description of the issue,
          and clear photos of the watch. If approved, we will arrange inspection
          and repair or replacement according to the circumstances.
        </p>
      </ContentSection>

      <ContentCta href="/contact" label="Contact Warranty Support" />
    </ContentPage>
  );
}
