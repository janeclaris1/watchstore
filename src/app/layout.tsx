import type { Metadata } from "next";
import { Playfair_Display, Inter, Cantora_One } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { Preloader } from "@/components/layout/Preloader";
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

const cantora = Cantora_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cantora",
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "algolia-site-verification": "163E676A1222ACC2",
    "google-site-verification": "_SPtOEkK2AipTYoZRjFj4R4QyFohXr8oq8tsposOpx4",
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
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${cantora.variable}`}>
      <head>
        <meta name="algolia-site-verification" content="163E676A1222ACC2" />
        <meta
          name="google-site-verification"
          content="_SPtOEkK2AipTYoZRjFj4R4QyFohXr8oq8tsposOpx4"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname||"";if(p.indexOf("/admin")===0||p.indexOf("/maintenance")===0){document.documentElement.classList.add("preload-skip");}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers>
          {isMaintenance ? (
            children
          ) : (
            <>
              <Preloader />
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
