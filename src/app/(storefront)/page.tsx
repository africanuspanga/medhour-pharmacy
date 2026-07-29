import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/constants";
import { getCategories, getFeaturedProducts } from "@/lib/data";
import { CategoryCard } from "@/components/category/category-card";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/feedback";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

const TRUST_BULLETS = [
  {
    label: "Genuine healthcare products",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.6 2A9 9 0 1112 3a9 9 0 018.6 9z"
      />
    ),
  },
  {
    label: "Convenient ordering",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l2.4 12.2a1 1 0 001 .8h8.9a1 1 0 001-.8L21 7H6m3 13a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
      />
    ),
  },
  {
    label: "Fast service within Dar es Salaam",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
  },
  {
    label: "Professional pharmacy support",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zm-4.3 13a2 2 0 01-3.4 0M12 2v2"
      />
    ),
  },
];

const WHY_CHOOSE = [
  {
    title: "Trusted pharmacy products",
    text: "Genuine medicines, healthcare and wellness products sourced from reputable suppliers.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l7 4v5c0 4.4-3 8.1-7 9-4-0.9-7-4.6-7-9V7l7-4zm-2 9l2 2 4-4"
      />
    ),
  },
  {
    title: "Convenient location in Posta",
    text: "Find us at Benjamin Tower on Azikiwe Street, in the heart of Dar es Salaam.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
      />
    ),
  },
  {
    title: "Prescription upload",
    text: "Upload your prescription online and our pharmacists will prepare your order.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"
      />
    ),
  },
  {
    title: "Helpful customer service",
    text: "Friendly support from qualified pharmacy staff, in store, by phone or on WhatsApp.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 01-13.2 7.9L3 21l1.2-4.2A9 9 0 1121 12z"
      />
    ),
  },
];

const PROMOS: {
  title: string;
  text: string;
  href: string;
  image: string | null;
  imageAlt: string | null;
  icon: React.ReactNode;
}[] = [
  {
    title: "Mother and Baby Care",
    text: "Everything needed for mothers, babies and growing families.",
    href: "/categories/mother-baby",
    image: "/images/promo-mother-baby.jpg",
    imageAlt: "Expectant mother — mother and baby care at Medhour Pharmacy",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-8-4.8-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 6.2-8 11-8 11z"
      />
    ),
  },
  {
    title: "Migraine & Head Pain Relief",
    text: "Trusted relief for headaches, migraines and body pain.",
    href: "/categories/pain-relief",
    image: "/images/promo-headache.jpg",
    imageAlt: "Man with a headache — pain relief at Medhour Pharmacy",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
  },
  {
    title: "Vitamins and Daily Wellness",
    text: "Support your everyday health with trusted wellness products.",
    href: "/categories/vitamins-supplements",
    image: null,
    imageAlt: null,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-5.5l-2 2m-7 7l-2 2m11 0l-2-2m-7-7l-2-2m6 5.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
  },
];

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(8)]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
      {/* Hero */}
      <section className="mt-6 rounded-3xl bg-brand px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Your Trusted Pharmacy in Dar es Salaam
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
              Order medicines, healthcare products, personal-care essentials and wellness products
              from Medhour Pharmacy.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-brand-dark transition-colors hover:bg-brand-light"
              >
                Shop Now
              </Link>
              <Link
                href="/prescriptions/upload"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"
                  />
                </svg>
                Upload Prescription
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[3/4] w-full max-w-xs sm:max-w-sm">
            <div className="absolute inset-x-4 bottom-0 top-10 rounded-full bg-white/10" aria-hidden />
            <Image
              src="/images/hero-doctor.png"
              alt="Medhour Pharmacy pharmacist"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-contain object-bottom"
            />
          </div>
        </div>

        <ul className="mt-10 grid gap-4 border-t border-white/20 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_BULLETS.map((b) => (
            <li key={b.label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {b.icon}
                </svg>
              </span>
              <span className="text-sm font-medium">{b.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Shop by Category */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">Shop by Category</h2>
            <p className="mt-1 text-sm text-ink/60">Browse medicines and health products by category.</p>
          </div>
          <Link href="/categories" className="shrink-0 text-sm font-semibold text-brand hover:text-brand-dark">
            View all →
          </Link>
        </div>
        {categories.length === 0 ? (
          <EmptyState title="Categories coming soon" description="We are stocking our shelves — check back shortly." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">Featured Products</h2>
            <p className="mt-1 text-sm text-ink/60">Popular products our customers trust.</p>
          </div>
          <Link href="/shop" className="shrink-0 text-sm font-semibold text-brand hover:text-brand-dark">
            Shop all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <EmptyState
            title="Products coming soon"
            description="We are adding our first products — check back shortly."
            action={
              <Link href="/shop" className="text-sm font-semibold text-brand hover:text-brand-dark">
                Browse the shop
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional banners */}
      <section className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PROMOS.map((promo) => (
          <Link
            key={promo.href}
            href={promo.href}
            className="group flex items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-sm transition-shadow hover:shadow-md sm:p-8"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold sm:text-xl">{promo.title}</h3>
              <p className="mt-1 text-sm text-white/85">{promo.text}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 group-hover:underline">
                Shop now
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            {promo.image ? (
              <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32">
                <Image
                  src={promo.image}
                  alt={promo.imageAlt ?? promo.title}
                  fill
                  sizes="(max-width: 640px) 96px, 128px"
                  className="object-cover"
                />
              </span>
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {promo.icon}
                </svg>
              </span>
            )}
          </Link>
        ))}
      </section>

      {/* Why Choose */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-ink">Why Choose Medhour Pharmacy?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE.map((item) => (
            <div key={item.title} className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {item.icon}
                </svg>
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm text-ink/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="mt-14 grid gap-6 rounded-3xl border border-ink/8 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-ink">Visit Us</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            {SITE.address.name}, {SITE.address.building}, {SITE.address.street}, {SITE.address.city},{" "}
            {SITE.address.country}
          </p>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-medium text-ink/50">Phone</dt>
              <dd>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="font-semibold text-brand hover:text-brand-dark">
                  {SITE.phone}
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-medium text-ink/50">Email</dt>
              <dd>
                <a href={`mailto:${SITE.email}`} className="font-semibold text-brand hover:text-brand-dark">
                  {SITE.email}
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-medium text-ink/50">Opening hours</dt>
              <dd className="text-ink/80">{SITE.openingHours}</dd>
            </div>
          </dl>
          <a
            href={SITE.mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
              />
            </svg>
            Get Directions
          </a>
        </div>
        <div className="overflow-hidden rounded-2xl border border-ink/8">
          <iframe
            src={SITE.mapsEmbedUrl}
            title="Map — Medhour Pharmacy, Benjamin Tower, Azikiwe Street, Posta, Dar es Salaam"
            className="h-64 w-full lg:h-full lg:min-h-72"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
}
