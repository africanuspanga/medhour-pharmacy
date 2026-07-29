"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartTotals } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

const ICONS = {
  home: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5V21h14V9.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 3h3l2.6 12.4a1 1 0 001 .8h8.9a1 1 0 001-.8L21 7H6" />
    </>
  ),
  track: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" />
    </>
  ),
} as const;

function Tab({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
        active ? "text-brand" : "text-ink/50"
      )}
      aria-current={active ? "page" : undefined}
    >
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {ICONS[icon]}
      </svg>
      {label}
    </Link>
  );
}

/** App-style bottom navigation for mobile — hidden on lg and up. */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCartTotals();
  const mounted = useMounted();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="relative grid grid-cols-5">
        <Tab href="/" label="Home" icon="home" active={isActive("/")} />
        <Tab href="/search" label="Search" icon="search" active={isActive("/search")} />

        {/* Center cart action */}
        <div className="relative flex items-start justify-center">
          <Link
            href="/cart"
            aria-label={`Shopping cart${mounted && count > 0 ? `, ${count} items` : ""}`}
            className={cn(
              "absolute -top-5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white text-white shadow-lg",
              isActive("/cart") ? "bg-brand-dark" : "bg-brand"
            )}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {ICONS.cart}
            </svg>
            {mounted && count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1 text-xs font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          <span className={cn("mt-9 pb-1 text-[11px] font-medium", isActive("/cart") ? "text-brand" : "text-ink/50")}>
            Cart
          </span>
        </div>

        <Tab href="/track-order" label="Track" icon="track" active={isActive("/track-order")} />
        <Tab href="/account" label="Account" icon="account" active={isActive("/account")} />
      </div>
    </nav>
  );
}
