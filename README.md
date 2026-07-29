# Medhour Pharmacy

A clean, modern e-commerce website for **Medhour Pharmacy** — Benjamin Tower, Azikiwe Street, Posta, Dar es Salaam, Tanzania.

Built with **Next.js 16.2** (App Router), **TypeScript**, **Tailwind CSS v4**, and **Supabase** (PostgreSQL, Auth, Storage). Deploys to Vercel.

## Features

- Storefront: homepage, shop with filters/search/sort/pagination, product details, category pages
- Shopping cart persisted in localStorage (guests), synced to Supabase after login
- Checkout: delivery or store pickup, cash on delivery / payment on pickup / mobile money (pending), unique order numbers (`MED-2026-00001`), WhatsApp follow-up
- Prescription upload (JPG/PNG/PDF) to **private** Supabase Storage with pharmacist review workflow
- Customer accounts: register, login, password reset, orders, reorder, addresses, prescriptions, profile
- Admin dashboard at `/admin`: sales/stock summary, product & category management, image uploads, order management (statuses, payment, notes, print, CSV export), prescription review with signed URLs, inventory with stock-movement history
- SEO: per-page metadata, Open Graph image, sitemap, robots, Product + Pharmacy structured data
- Row Level Security on every table; admin mutations go through server actions with server-side admin verification

## Prerequisites

- Node.js 20+
- A Supabase project (free tier is fine)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create the database**

   In the Supabase dashboard → SQL Editor, run:

   1. `supabase/migrations/20260729000001_initial_schema.sql` — tables, RLS policies, storage buckets
   2. `supabase/seed.sql` — 8 categories, brands, 20 sample products, site settings

   (Or with the Supabase CLI: `supabase link` then `supabase db push`, then run the seed.)

3. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Fill in from Supabase dashboard → Settings → API:

   | Variable | Where to find it |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
   | `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key — **server only, never expose** |
   | `NEXT_PUBLIC_SITE_URL` | Your production URL (used for SEO/canonicals) |

4. **Run**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000

## Creating an admin user

1. Register a normal account at `/register` (or in Supabase → Authentication).
2. In the Supabase SQL editor:

   ```sql
   update public.profiles set is_admin = true where email = 'you@example.com';
   ```

3. Log in and visit `/admin`.

## Replacing sample content

- **Product & category images**: the site ships with empty image placeholders. Upload real images from the admin dashboard (Products → edit → Images; Categories → edit). They are stored in the public `product-images` bucket.
- **Sample products**: prices, pack sizes and prescription classifications in `supabase/seed.sql` are placeholders — verify every product against actual stock before going live.
- **Contact details**: phone, WhatsApp, email and opening hours are placeholders in `src/lib/constants.ts` (and the `site_settings` table).

## Project structure

```text
src/
  app/
    (storefront)/       # public pages (home, shop, product, cart, checkout, …)
    admin/              # protected admin dashboard
    api/                # route handlers (search)
    auth/callback/      # Supabase auth code exchange
  components/           # shared UI, layout, product, admin, account components
  lib/
    actions/            # server actions (checkout, auth, admin, …)
    supabase/           # browser / server / service-role clients, admin guard
    data.ts             # server-side storefront queries
    cart-store.ts       # zustand guest cart (localStorage)
    types.ts            # database-mirroring TypeScript types
supabase/
  migrations/           # schema + RLS + storage buckets
  seed.sql              # categories, brands, 20 sample products
```

## Deployment (Vercel)

1. Push the repo to GitHub and import it into Vercel.
2. Add the same environment variables from `.env.local` in Vercel → Settings → Environment Variables.
3. Deploy. Set `NEXT_PUBLIC_SITE_URL` to the production domain so metadata, canonicals and the sitemap resolve correctly.

## Deploy a static demo on Render

A read-only static export of the storefront — for stakeholder demos — can be
hosted on Render as a static site. It uses the local catalogue in
`src/lib/fallback-data.ts` (no Supabase needed).

**What works in the static demo:** browsing home/shop/categories/product pages,
search (falls back to filtering the local catalogue in the browser), and the
guest cart (localStorage).

**What requires the full deployment (Vercel + Supabase):** checkout and order
confirmation, accounts (login/register/profile/orders/addresses), prescription
upload, order tracking, the contact form, and the admin dashboard. Links to
those pages 404 in the static build because they are excluded from it.

**Local run:**

```bash
npm run build:static   # produces out/
npx serve out          # or python3 -m http.server -d out
```

`scripts/build-static.mjs` temporarily moves the server-only paths
(`src/middleware.ts`, `src/app/admin`, `src/app/api`, `src/app/auth`,
`(storefront)/account`, `checkout`, `login`, `register`, `forgot-password`,
`reset-password`, `track-order`, `prescriptions`, `contact`) into
`.static-exclude/`, runs `next build` with `BUILD_STATIC=1` (which enables
`output: "export"`, unoptimized images and trailing slashes in
`next.config.ts`), then always restores them. `npm run build` and
`npm run dev` are unaffected.

**Render:** the repo includes `render.yaml` (blueprint). In Render choose
New → Blueprint, point it at the repo, and it creates a static site with
`npm ci && npm run build:static` publishing `out/`.

## Compliance notes

- Medicine information pages display the medicine disclaimer; the site is not a substitute for professional medical advice.
- Prescription-required products cannot complete normal checkout without a prescription upload and pharmacy approval.
- Antibiotics and other prescription-only medicines are **not** preloadable products by design.
