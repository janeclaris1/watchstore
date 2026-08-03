import Link from "next/link";
import { Check, Package, Shield } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Check, label: "Statement of Promise" },
  { icon: Package, label: "Secure Delivery" },
  { icon: Shield, label: "14-Day Returns" },
] as const;

export function TopUtilityBar() {
  return (
    <div className="bg-[#f0f0f0] border-b border-black/5 text-[12px] sm:text-[13px] text-wf-black">
      <div className="max-w-7xl mx-auto px-4 h-9 sm:h-10 flex items-center justify-between gap-4">
        <ul className="flex items-center gap-4 sm:gap-8 min-w-0 overflow-x-auto scrollbar-thin">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={1.75} />
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3 shrink-0 text-wf-black/90">
          <a
            href="mailto:support@cosyaura.us"
            className="font-semibold hover:text-gold transition-colors"
          >
            support@cosyaura.us
          </a>
          <span className="text-wf-black/30" aria-hidden>
            |
          </span>
          <Link href="/faq" className="hover:text-gold transition-colors">
            Help
          </Link>
          <span className="text-wf-black/30" aria-hidden>
            |
          </span>
          <Link href="/contact" className="hover:text-gold transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
