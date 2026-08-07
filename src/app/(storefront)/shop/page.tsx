import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/data";
import type { ShopFilters } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/feedback";
import { ShopFilters as ShopFiltersPanel, ShopFiltersMobile } from "@/components/storefront/shop-filters";
import { Pagination } from "@/components/storefront/pagination";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse medicines, healthcare products, personal-care essentials and wellness products at Medhour Pharmacy, Dar es Salaam.",
  alternates: { canonical: "/shop" },
};

interface ShopSearchParams {
  q?: string;
  category?: string;
  rx?: string;
  in_stock?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
}

function parseFilters(sp: ShopSearchParams): ShopFilters {
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;
  const page = sp.page ? Number(sp.page) : 1;
  return {
    query: sp.q?.trim() || undefined,
    category: sp.category || undefined,
    requiresPrescription: sp.rx === "yes" || sp.rx === "no" ? sp.rx : undefined,
    inStock: sp.in_stock === "1" || sp.in_stock === "true" ? true : undefined,
    minPrice: min != null && Number.isFinite(min) ? min : undefined,
    maxPrice: max != null && Number.isFinite(max) ? max : undefined,
    sort: ["newest", "price_asc", "price_desc", "name_asc"].includes(sp.sort ?? "")
      ? (sp.sort as ShopFilters["sort"])
      : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const sp: ShopSearchParams = await searchParams;
  const filters = parseFilters(sp);
  const [categories, result] = await Promise.all([getCategories(), getProducts(filters)]);

  // Preserve current params (minus page) for pagination links.
  const currentParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (value && key !== "page") currentParams[key] = value;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Shop</h1>
      <p className="mt-1 text-sm text-ink/60">
        {result.total} {result.total === 1 ? "product" : "products"}
        {filters.query && (
          <>
            {" "}
            for “<span className="font-medium text-ink">{filters.query}</span>”
          </>
        )}
      </p>

      <ShopFiltersMobile>
        <ShopFiltersPanel categories={categories} />
      </ShopFiltersMobile>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
            <ShopFiltersPanel categories={categories} />
          </div>
        </aside>

        <div>
          {result.products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your search or filters."
              action={
                <Link href="/shop" className="text-sm font-semibold text-brand hover:text-brand-dark">
                  Clear filters
                </Link>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {result.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination page={result.page} totalPages={result.totalPages} searchParams={currentParams} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
