"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { SearchBar } from "@/components/search/SearchBar";
import { cn } from "@/lib/utils";

const BRANDS = [
  { name: "Rolex", slug: "rolex" },
  { name: "Patex Philippe", slug: "patek-philippe" },
  { name: "Omega", slug: "omega" },
  { name: "Hublot", slug: "hublot" },
  { name: "Cartier", slug: "cartier" },
  { name: "Louis Vuitton", slug: "louis-vuitton" },
];

const PRICE_RANGES = [
  { label: "Under $400", href: "/watches?maxPrice=400" },
  { label: "$400 – $500", href: "/watches?minPrice=400&maxPrice=500" },
  { label: "All under $500", href: "/watches?maxPrice=500" },
];

const CONDITIONS = [
  { label: "New", href: "/watches?condition=UNWORN" },
];

const GENDERS = [
  { label: "Men's", href: "/watches?gender=MENS" },
  { label: "Women's", href: "/watches?gender=WOMENS" },
];

function NavDropdown({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 px-4 py-3 text-sm text-wf-black hover:text-gold transition-colors">
        {label}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute top-full left-0 bg-white border border-wf-border shadow-lg rounded-b-lg min-w-[200px] z-50 py-2">
          {children}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const { items, toggleCart, currency, setCurrency } = useCartStore();
  const wishlistItems = useWishlistStore((s) => s.items);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const currencies = ["USD", "GBP", "EUR"] as const;
  const currencySymbols = { GBP: "£", USD: "$", EUR: "€" };

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Top Nav */}
      <div className="border-b border-wf-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-playfair text-2xl tracking-[2px] text-wf-black shrink-0"
          >
            COSY AURA WATCH STORE
          </Link>

          {/* Search - desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            {/* Currency */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="text-sm font-medium text-wf-gray hover:text-gold transition-colors"
              >
                {currencySymbols[currency]}
              </button>
              {currencyOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-wf-border shadow-lg rounded-lg py-1 z-50">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setCurrencyOpen(false);
                      }}
                      className={cn(
                        "block w-full px-4 py-2 text-sm text-left hover:bg-wf-light",
                        currency === c && "text-gold font-medium"
                      )}
                    >
                      {currencySymbols[c]} {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/wishlist" className="relative p-1 hover:text-gold transition-colors">
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link href="/account" className="p-1 hover:text-gold transition-colors hidden sm:block">
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={toggleCart}
              className="relative p-1 hover:text-gold transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Secondary Nav */}
      <nav className="hidden md:block border-b border-wf-border bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center">
          <NavDropdown label="Brands">
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/watches/${brand.slug}`}
                className="block px-4 py-2 text-sm hover:bg-wf-light hover:text-gold transition-colors"
              >
                {brand.name}
              </Link>
            ))}
          </NavDropdown>

          <NavDropdown label="Price">
            {PRICE_RANGES.map((range) => (
              <Link
                key={range.label}
                href={range.href}
                className="block px-4 py-2 text-sm hover:bg-wf-light hover:text-gold transition-colors"
              >
                {range.label}
              </Link>
            ))}
          </NavDropdown>

          <NavDropdown label="Condition">
            {CONDITIONS.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="block px-4 py-2 text-sm hover:bg-wf-light hover:text-gold transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </NavDropdown>

          <NavDropdown label="Gender">
            {GENDERS.map((g) => (
              <Link
                key={g.label}
                href={g.href}
                className="block px-4 py-2 text-sm hover:bg-wf-light hover:text-gold transition-colors"
              >
                {g.label}
              </Link>
            ))}
          </NavDropdown>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 bg-white border-b border-wf-border",
          mobileOpen ? "max-h-[600px]" : "max-h-0"
        )}
      >
        <div className="px-4 py-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-wf-gray mb-2">Brands</p>
            <div className="grid grid-cols-2 gap-1">
              {BRANDS.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/watches/${brand.slug}`}
                  className="text-sm py-1.5 hover:text-gold"
                  onClick={() => setMobileOpen(false)}
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-wf-gray mb-2">Shop By</p>
            <div className="space-y-1">
              {PRICE_RANGES.map((r) => (
                <Link key={r.label} href={r.href} className="block text-sm py-1.5 hover:text-gold" onClick={() => setMobileOpen(false)}>
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
