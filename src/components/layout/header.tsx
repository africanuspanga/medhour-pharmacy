"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCartTotals } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { WHATSAPP_URL } from "@/lib/constants";

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

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand hover:bg-brand-light"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2a9.9 9.9 0 00-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1012.04 2zm0 1.8a8.1 8.1 0 110 16.2 8 8 0 01-4.1-1.1l-.3-.2-2.9.9 1-2.8-.2-.3a8.1 8.1 0 016.5-12.7zm-3.4 4c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.4.9 2.9.7 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4l-2-.9c-.3-.2-.5-.2-.7.1l-1 1.2c-.2.2-.4.3-.7.1a9.5 9.5 0 01-2.7-1.7 10 10 0 01-1.9-2.3c-.2-.3 0-.5.1-.7l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5L9.6 8.2c-.2-.4-.4-.4-.6-.4z" />
            </svg>
          </a>

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
