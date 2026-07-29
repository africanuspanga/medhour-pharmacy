"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCartTotals } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function CartBadge() {
  const { count } = useCartTotals();
  const mounted = useMounted();
  if (!mounted || count === 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0" aria-label="Medhour Pharmacy home">
          <Image
            src="/medhour-logo.png"
            alt="Medhour Pharmacy"
            width={150}
            height={58}
            className="h-9 w-auto sm:h-11"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-ink/80 hover:bg-brand-light hover:text-brand-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form
          action="/search"
          className="relative ml-auto hidden min-w-0 flex-1 max-w-xs sm:block md:max-w-sm"
          role="search"
        >
          <input
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines, health products…"
            className="w-full rounded-full border border-ink/15 bg-surface py-2 pl-10 pr-4 text-sm focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
            aria-label="Search products"
          />
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
          </svg>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/prescriptions/upload"
            className="hidden items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark md:inline-flex"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
            </svg>
            Upload Prescription
          </Link>

          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-surface"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 3h3l2.6 12.4a1 1 0 001 .8h8.9a1 1 0 001-.8L21 7H6" />
            </svg>
            <CartBadge />
          </Link>

          <Link
            href="/account"
            aria-label="Account"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-surface"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path strokeLinecap="round" d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" />
            </svg>
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-surface lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="border-t border-ink/8 bg-white px-4 py-3 lg:hidden" aria-label="Mobile">
          <form action="/search" className="mb-3 sm:hidden" role="search">
            <input
              type="search"
              name="q"
              placeholder="Search medicines, health products…"
              className="w-full rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm focus:border-brand focus:outline-none"
              aria-label="Search products"
            />
          </form>
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-brand-light"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/prescriptions/upload"
                onClick={() => setMenuOpen(false)}
                className="mt-2 block rounded-full bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Upload Prescription
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
