import Link from "next/link";
import Image from "next/image";
import { SITE, WHATSAPP_URL } from "@/lib/constants";

const SHOP_LINKS = [
  { href: "/shop", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/prescriptions/upload", label: "Upload Prescription" },
  { href: "/track-order", label: "Track Order" },
];

const INFO_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "FAQs" },
  { href: "/delivery-info", label: "Delivery Information" },
];

const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/returns-refunds", label: "Returns & Refunds" },
  { href: "/medicine-disclaimer", label: "Medicine Disclaimer" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink/8 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Image src="/medhour-logo.png" alt="Medhour Pharmacy" width={140} height={54} className="h-10 w-auto" />
          <p className="mt-4 text-sm text-ink/60">
            {SITE.address.building}, {SITE.address.street}, {SITE.address.city}, {SITE.address.country}
          </p>
          <p className="mt-2 text-sm text-ink/60">{SITE.phone}</p>
          <p className="text-sm text-ink/60">{SITE.email}</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
          >
            Chat with us on WhatsApp
          </a>
        </div>

        <nav aria-label="Shop">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Shop</h3>
          <ul className="mt-3 space-y-2">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ink/60 hover:text-brand">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Information">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Information</h3>
          <ul className="mt-3 space-y-2">
            {INFO_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ink/60 hover:text-brand">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Legal</h3>
          <ul className="mt-3 space-y-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ink/60 hover:text-brand">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-ink/8">
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8">
          <p className="text-xs text-ink/50">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
