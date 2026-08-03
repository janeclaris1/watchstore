import Link from "next/link";
import type { ReactNode } from "react";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const SHOP_LINKS = [
  { label: "All Watches", href: "/watches" },
  { label: "Rolex", href: "/watches/rolex" },
  { label: "Patex Philippe", href: "/watches/patek-philippe" },
  { label: "Omega", href: "/watches/omega" },
  { label: "Hublot", href: "/watches/hublot" },
  { label: "Jacob & Co", href: "/watches/jacob-co" },
  { label: "Tissot", href: "/watches/tissot" },
  { label: "Timex", href: "/watches/timex" },
  { label: "Vacheron Constantin", href: "/watches/vacheron-constantin" },
];

const SUPPORT_LINKS = [
  { label: "FAQ", href: "/faq" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact", href: "/contact" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Journal", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
  { label: "Sustainability", href: "/sustainability" },
];

function FooterInfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">
        {title}
      </h3>
      <div className="space-y-3 text-sm text-gray-400 leading-relaxed">{children}</div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-wf-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 */}
          <div>
            <div className="mb-5">
              <BrandLogo variant="dark" size="lg" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Premium luxury watch store. Every watch is sold new and delivered
              after successful payment confirmation.
            </p>
            <address className="not-italic text-sm text-gray-400 leading-relaxed mb-6">
              30 N Gould St Ste R
              <br />
              Sheridan, WY 82801
            </address>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Delivery & tracking */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <FooterInfoSection title="Delivery Information">
            <p>
              Orders placed on COSY AURA WATCH STORE can be delivered every day of
              the week. Delivery costs and estimated delivery dates will vary
              depending on the service selected, where your item is coming from
              and its destination. Express delivery is available for the majority
              of destinations. Standard delivery is available in selected
              countries. When you&apos;re placing your order, the available
              delivery options for your destination will be displayed at
              checkout.
            </p>
            <p>
              Some COSY AURA WATCH STORE orders must be signed upon delivery. We
              kindly ask that you track your order and ensure availability at the
              time of delivery. If there is no availability to receive and sign
              the order, the carrier may, at their sole discretion, attempt
              another delivery or redirect the parcel to a designated collection
              point. Please note that if the order is not received or collected
              within the carrier&apos;s timeframe, it will be returned to origin
              (RTO).
            </p>
            <p>
              For shipments to the US, we offer the option to waive the signature
              requirement upon delivery during checkout. By clicking to change
              the delivery option, you authorise the carrier to leave your
              package at your doorstep or designated safe location without
              obtaining a signature. This not only saves you the hassle of
              rescheduling deliveries or picking up your package from a
              designated location but also ensures that your order arrives
              promptly and conveniently, even if you&apos;re not home to receive
              it. Please note that while we take every precaution to ensure the
              safe delivery of your package, waiving the signature requirement
              releases COSY AURA WATCH STORE from liability for any loss or
              damage that may occur after delivery.
            </p>
          </FooterInfoSection>

          <FooterInfoSection title="Tracking Your Order">
            <p>
              After you&apos;ve placed an order, we&apos;ll email you with all
              the details. We have 2 business days to process your order. Once
              your order is sent, you&apos;ll receive an email with the tracking
              number. You can also track your order by heading to{" "}
              <Link href="/account" className="text-gray-300 underline underline-offset-2 hover:text-gold transition-colors">
                Orders &amp; Returns
              </Link>{" "}
              in your account.
            </p>
            <p>
              Depending on your location and selected delivery method, it can
              take 2 – 7 business days for your package to arrive. We always aim
              to deliver your package within the time specified, but sometimes
              there may be delays due to customs clearance or failed payments.
            </p>
            <p>
              If you&apos;ve shopped items from multiple locations, you may
              receive more than one package.
            </p>
            <p>
              In order to improve your delivery experience, we&apos;ll send you
              communications regarding your shipment status through email and
              SMS. No personal contact information will be shared with third
              parties/affiliates for marketing/promotional purposes. All previous
              categories exclude text messaging originator opt-in data and
              consent; this information will not be shared with any third
              parties.
            </p>
          </FooterInfoSection>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} COSY AURA WATCH STORE. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {["Visa", "Mastercard", "Amex", "PayPal"].map((method) => (
              <span
                key={method}
                className="text-[10px] text-gray-500 border border-gray-700 rounded px-2 py-1"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
