"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/admin/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/prescriptions", label: "Prescriptions" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/messages", label: "Messages" },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** Admin navigation — sidebar on desktop, horizontal scroll bar on mobile. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="shrink-0 bg-brand-dark text-white print:hidden md:min-h-[calc(100vh-3.5rem)] md:w-60">
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:gap-1.5 md:p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(pathname, link.href)
                ? "bg-white/15 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {link.label}
          </Link>
        ))}
        <div className="my-1 hidden border-t border-white/15 md:block" />
        <Link
          href="/"
          className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          View store
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Sign out
          </button>
        </form>
      </nav>
    </aside>
  );
}
