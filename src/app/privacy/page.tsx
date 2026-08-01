import type { Metadata } from "next";
import {
  ContentPage,
  ContentSection,
} from "@/components/content/ContentPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How COSY AURA WATCH STORE collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      subtitle="We respect your privacy and are clear about how information is used when you shop with us."
    >
      <ContentSection title="Who we are">
        <p>
          COSY AURA WATCH STORE (“we”, “us”) operates this website to offer brand-new
          luxury watches for sale. This policy explains what information we collect and
          why.
        </p>
      </ContentSection>

      <ContentSection title="Information we collect">
        <p>
          We may collect account details (such as name and email), order and shipping
          information, payment references processed by our payment provider, messages you
          send through contact forms, and technical data such as device type, browser,
          and approximate location derived from IP address.
        </p>
      </ContentSection>

      <ContentSection title="Cookies and similar technologies">
        <p>
          Essential cookies keep the site secure and allow cart and checkout to work.
          With your consent, we may also use analytics, personalisation, and marketing
          cookies. You can accept, reject, or customise non-essential cookies via the
          banner on our site. Your choice is stored in your browser so we can honour it
          on later visits.
        </p>
      </ContentSection>

      <ContentSection title="How we use information">
        <p>
          We use personal information to process orders, deliver watches after payment
          confirmation, respond to enquiries, improve the storefront, prevent fraud, and
          - where you allow it - measure performance and show relevant offers.
        </p>
      </ContentSection>

      <ContentSection title="Sharing">
        <p>
          We share data with service providers who help us operate the store (for
          example payment processors, email delivery, and hosting). We do not sell your
          personal information.
        </p>
      </ContentSection>

      <ContentSection title="Your choices">
        <p>
          You may request access to, correction of, or deletion of personal data we hold
          about you, subject to legal obligations such as order records. To exercise
          these rights, contact us through the Contact page.
        </p>
      </ContentSection>

      <ContentSection title="Updates">
        <p>
          We may update this policy from time to time. The latest version will always be
          available on this page.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
