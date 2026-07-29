# Medhour Pharmacy — project conventions

Next.js 16.2 (App Router, `src/`), TypeScript, Tailwind CSS v4, Supabase (Postgres + Auth + Storage), zustand for the guest cart. Import alias `@/*` → `src/*`.

## Brand tokens (Tailwind v4 theme in `src/app/globals.css`)

Use these utility colors — never hard-code hex values:
- `bg-brand` / `text-brand` — primary green #008F5A
- `bg-brand-dark` / `text-brand-dark` — #006B45
- `bg-brand-light` — #EAF8F1
- `bg-surface` — light grey #F6F7F8
- `text-ink` — dark text #18251F (use `text-ink/60` etc. for muted)

Style: clean white backgrounds, green accents, rounded-2xl cards, generous spacing, mobile-first responsive.

## Existing building blocks — reuse, don't reinvent

- Types: `src/lib/types.ts` (Product, Category, Order, OrderStatus, etc.)
- Utils: `src/lib/utils.ts` — `cn`, `formatTzs(n)` → `TZS 5,000`, `effectivePrice`, `stockStatus`, `formatDate(Time)`, `ORDER_STATUS_LABELS`, `PAYMENT_STATUS_LABELS`, `PAYMENT_METHOD_LABELS`
- Constants: `src/lib/constants.ts` — `SITE` (address, phone, whatsapp, mapsEmbedUrl, mapsDirectionsUrl, openingHours), `WHATSAPP_URL`, `MEDICINE_DISCLAIMER`, `PRODUCTS_PER_PAGE`
- Supabase clients: `src/lib/supabase/client.ts` (browser), `server.ts` (RSC/actions, `await createClient()`), `admin.ts` (service role — server only), `admin-auth.ts` (`requireAdmin()` throws unless caller is admin)
- Data access (server): `src/lib/data.ts` — `getCategories`, `getCategoryBySlug`, `getFeaturedProducts`, `getProducts(filters)`, `getProductBySlug`, `getRelatedProducts`, `searchProducts`, `getAllProductSlugs`
- Cart store (client): `src/lib/cart-store.ts` — `useCartStore` (addItem/updateQuantity/removeItem/clearCart, persisted to localStorage) and `useCartTotals()` → `{ items, subtotal, count, hasPrescriptionItems }`
- Toast (client): `src/components/ui/toast.tsx` — `useToast()` → `toast(message, "success"|"error"|"info")`
- UI primitives: `src/components/ui/button.tsx` (`<Button variant="primary|secondary|outline|ghost|danger" size="sm|md|lg">`), `badge.tsx` (`<Badge tone="green|red|amber|grey|blue">`), `field.tsx` (`Input`, `Select`, `Textarea`, `<Field label required error>`), `feedback.tsx` (`Spinner`, `EmptyState`), `image-placeholder.tsx`
- Product components: `src/components/product/product-card.tsx` (`<ProductCard product>`), `product-image.tsx` (falls back to placeholder — the pharmacy will upload real images later, so ALWAYS use this, never raw `<img>`), `add-to-cart-button.tsx`
- Category: `src/components/category/category-card.tsx`
- Layout: `src/components/layout/header.tsx`, `footer.tsx`, `src/components/whatsapp-float.tsx` — already wired into `src/app/layout.tsx`

## Rules

- All data comes from Supabase — no hard-coded products or categories in pages.
- Server Components fetch via `src/lib/data.ts` or the server Supabase client. Client components use the browser client.
- Admin mutations live in server actions (`"use server"`) under `src/lib/actions/` and MUST call `requireAdmin()` before using the service-role client.
- Product/category images may not exist yet — `ProductImage` handles the empty placeholder.
- Medicine pages must show `MEDICINE_DISCLAIMER` where medicine info is presented.
- Currency is always rendered with `formatTzs`.
- Pages must export `metadata` (or `generateMetadata`) — SEO is a requirement.
- Keep components small and colocated: page-specific components in `src/components/<area>/`.
- Don't modify the files listed above unless a task explicitly requires it; compose on top of them.
- Verify with `npm run build` when done; fix type errors you introduced.
