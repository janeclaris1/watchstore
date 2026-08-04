import type { Metadata } from "next";
import { AboutPageContent } from "@/components/about/AboutPageContent";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "COSY AURA WATCH STORE curated brand-new luxury watches, secure checkout, worldwide delivery, and 14-day returns.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
