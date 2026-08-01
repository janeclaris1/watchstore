import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { NewsletterPopup } from "@/components/home/NewsletterPopup";
import { Providers } from "@/components/Providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "COSY AURA WATCH STORE | New Luxury Watches",
    template: "%s | COSY AURA WATCH STORE",
  },
  description:
    "Discover brand-new luxury watches. Secure payment with dispatch and delivery after payment confirmation.",
  keywords: ["luxury watches", "new watches", "Rolex", "Omega", "Patek Philippe", "Cartier"],
  other: {
    "algolia-site-verification": "163E676A1222ACC2",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") || "";
  const isMaintenance = pathname.startsWith("/maintenance");

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <meta name="algolia-site-verification" content="163E676A1222ACC2" />
      </head>
      <body>
        <Providers>
          {isMaintenance ? (
            children
          ) : (
            <>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <CartDrawer />
              <NewsletterPopup />
              <CookieConsent />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
