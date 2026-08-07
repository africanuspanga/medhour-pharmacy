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

## Admin account

There is exactly one admin account, hardcoded (see `supabase/admin-user.sql`):

- **Email:** `admin@medhour.co.tz`
- **Password:** `Medhour@2026!`

It is provisioned via the Supabase Auth admin API and granted `is_admin = true`
on its profile — `supabase/admin-user.sql` contains the recreation command and
the idempotent grant. Log in at `/login`, then visit `/admin`.

## Replacing sample content

- **Product & category images**: the site ships with empty image placeholders. Upload real images from the admin dashboard (Products → edit → Images; Categories → edit). They are stored in the public `product-images` bucket.
- **Sample products**: prices, pack sizes and prescription classifications in `supabase/seed.sql` are placeholders — verify every product against actual stock before going live.
- **Contact details**: phone, WhatsApp, email, address and opening hours live in `src/lib/constants.ts` (the `SITE` constant) and are shown on `/contact`.

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

The app is fully dynamic — every page reads from Supabase at request time and
`npm run build` always produces a server build. There is no static export.

## Compliance notes

- Medicine information pages display the medicine disclaimer; the site is not a substitute for professional medical advice.
- Prescription-required products cannot complete normal checkout without a prescription upload and pharmacy approval.
- Antibiotics and other prescription-only medicines are **not** preloadable products by design.
