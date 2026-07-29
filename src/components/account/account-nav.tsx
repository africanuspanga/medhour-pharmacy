"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";

const LINKS = [
  { href: "/account", label: "Orders", exact: true },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/prescriptions", label: "Prescriptions" },
  { href: "/account/profile", label: "Profile" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-ink/10 bg-white p-1 sm:flex-col sm:overflow-visible">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              active ? "bg-brand-light text-brand-dark" : "text-ink/70 hover:bg-surface hover:text-ink"
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <SignOutButton className="whitespace-nowrap rounded-xl px-4 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50" />
    </nav>
  );
}
