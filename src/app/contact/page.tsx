import type { Metadata } from "next";
import {
  ContentCta,
  ContentPage,
  ContentSection,
} from "@/components/content/ContentPage";
import { ContactForm } from "@/components/content/ContactForm";
import { Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with COSY AURA WATCH STORE for product questions, orders, and support.",
};

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      subtitle="Questions about a watch, your order, or aftercare? Our team is here to help."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        <div className="md:col-span-1 space-y-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-wf-black mb-1">Email</p>
              <a
                href="mailto:support@cosyaurawatchstore.com"
                className="text-sm text-wf-gray hover:text-gold"
              >
                support@cosyaurawatchstore.com
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-wf-black mb-1">Hours</p>
              <p className="text-sm text-wf-gray leading-relaxed">
                Monday – Friday
                <br />
                9:00 AM – 6:00 PM
              </p>
            </div>
          </div>
          <ContentSection>
            <p className="text-sm">
              For order updates, include your order number. We aim to reply
              within one business day.
            </p>
          </ContentSection>
        </div>

        <div className="md:col-span-2">
          <h2 className="font-playfair text-2xl text-wf-black mb-6">
            Send a message
          </h2>
          <ContactForm />
        </div>
      </div>

      <ContentCta />
    </ContentPage>
  );
}
