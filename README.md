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

   In the Supabase dashboard → SQL Editor, run, in order:

   1. `supabase/migrations/20260729000001_initial_schema.sql` — tables, RLS policies, storage buckets
   2. `supabase/migrations/20260807000001_contact_messages.sql` — contact form messages
   3. `supabase/migrations/20260812000001_product_internal_name.sql` — internal stock name on products
   4. `supabase/seed.sql` — 17 categories, 32 brands, the full 692-product catalogue, site settings

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

## Product catalogue

The catalogue is the pharmacy's real stock list, built from `MEDHOUR PRICE LIST.xlsx`
(693 rows → **692 products** across **17 categories**; one exact duplicate line was
merged). Selling price and on-hand stock are copied from the sheet verbatim.

> **The spreadsheet is deliberately not committed** — it contains the pharmacy's
> supplier **cost** prices and this repository is public. `*.xlsx` is gitignored.
> Keep your copy at the repo root to re-run the build. The Cost column is never
> read into `catalogue.json`, `seed.sql` or the database; only Selling Price is.

```text
MEDHOUR PRICE LIST.xlsx
  └─ scripts/build_catalogue.py   → scripts/catalogue.json  + scripts/CATALOGUE-REVIEW.md
       ├─ scripts/build_seed.py   → supabase/seed.sql        (fresh projects)
       └─ scripts/load-catalogue.mjs → Supabase              (existing project)
```

```bash
python3 scripts/build_catalogue.py            # parse the spreadsheet
python3 scripts/build_seed.py                 # regenerate supabase/seed.sql
node --env-file=.env.local scripts/load-catalogue.mjs --dry-run
node --env-file=.env.local scripts/load-catalogue.mjs   # replaces the live catalogue
```

`load-catalogue.mjs` deletes all products, brands and categories before inserting.
Order history survives — `order_items` keeps its own copy of the product name,
pack size and unit price, and `product_id` is `on delete set null`.

- **Display names** are tidied versions of the spreadsheet text: casing, spacing,
  expanded abbreviations (`Tbs` → `Tablets`) and unambiguous spelling fixes. The
  untouched original is stored on every product as `internal_name` and shown in the
  admin dashboard so staff can reconcile against their own price list.
- **`scripts/CATALOGUE-REVIEW.md`** is generated on every build and lists what needs
  a pharmacist's confirmation: unit corrections, possible duplicate lines, and rows
  whose product could not be identified.
- **`scripts/overrides.json`** holds the per-row manual corrections. Edit it and
  re-run the build to change how a row is published.

## Images

Every product and category starts with an **empty image container**. Upload real
photos from the admin dashboard (Products → edit → Images; Categories → edit);
they go to the public `product-images` Supabase Storage bucket. Until then
`ProductImage` renders the placeholder, so layout stays stable.

## Other content

- **Contact details**: phone, WhatsApp, email, address and opening hours live in `src/lib/constants.ts` (the `SITE` constant) and are shown on `/contact`.
- **Prescription flag**: every product is currently sold without a prescription gate
  (`requires_prescription = false`). Tick "Requires prescription" on a product in the
  admin dashboard to force a prescription upload and pharmacist approval at checkout.

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
  seed.sql              # GENERATED — 17 categories, 32 brands, 692 products
scripts/
  build_catalogue.py    # MEDHOUR PRICE LIST.xlsx -> catalogue.json
  build_seed.py         # catalogue.json -> supabase/seed.sql
  load-catalogue.mjs    # catalogue.json -> live Supabase project
  overrides.json        # manual per-row corrections
  catalogue.json        # GENERATED — the catalogue
  CATALOGUE-REVIEW.md   # GENERATED — items needing pharmacist review
```

## Deployment (Vercel)

1. Push the repo to GitHub and import it into Vercel.
2. Add the same environment variables from `.env.local` in Vercel → Settings → Environment Variables.
3. Deploy. Set `NEXT_PUBLIC_SITE_URL` to the production domain so metadata, canonicals and the sitemap resolve correctly.

The app is fully dynamic — every page reads from Supabase at request time and
`npm run build` always produces a server build. There is no static export.

## Compliance notes

- Medicine information pages display the medicine disclaimer; the site is not a substitute for professional medical advice.
- The prescription upload and pharmacist review workflow is available at `/prescriptions/upload`, and products flagged `requires_prescription` cannot complete checkout without an approved prescription.
- **No product is currently flagged as prescription-only.** The catalogue includes antibiotics, injectables and other medicines that are prescription-only under TMDA rules; the pharmacy chose to list them without a prescription gate. Tick "Requires prescription" per product in the admin dashboard to change this.
