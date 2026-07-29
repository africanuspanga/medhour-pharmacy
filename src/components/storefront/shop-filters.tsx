"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name_asc", label: "Name: A to Z" },
];

/** Sidebar filters for the shop page — updates the URL query string. */
export function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [min, setMin] = useState(searchParams.get("min") ?? "");
  const [max, setMax] = useState(searchParams.get("max") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rx = searchParams.get("rx") ?? "";
  const category = searchParams.get("category") ?? "";
  const inStock = searchParams.get("in_stock") === "1";
  const sort = searchParams.get("sort") ?? "newest";

  const push = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page"); // filters reset pagination
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  // Debounce free-text inputs (search + price range).
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      if (
        query !== (searchParams.get("q") ?? "") ||
        min !== (searchParams.get("min") ?? "") ||
        max !== (searchParams.get("max") ?? "")
      ) {
        push({ q: query.trim(), min, max });
      }
    }, 450);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, min, max]);

  const hasFilters = query || min || max || rx || category || inStock || sort !== "newest";

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="shop-search" className="mb-1 block text-sm font-medium text-ink">
          Search
        </label>
        <Input
          id="shop-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
        />
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-ink">Category</span>
        <ul className="space-y-1" role="list">
          <li>
            <button
              type="button"
              onClick={() => push({ category: "" })}
              className={cn(
                "w-full rounded-lg px-3 py-1.5 text-left text-sm",
                !category ? "bg-brand-light font-semibold text-brand-dark" : "text-ink/70 hover:bg-surface"
              )}
            >
              All categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => push({ category: c.slug })}
                className={cn(
                  "w-full rounded-lg px-3 py-1.5 text-left text-sm",
                  category === c.slug
                    ? "bg-brand-light font-semibold text-brand-dark"
                    : "text-ink/70 hover:bg-surface"
                )}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label htmlFor="shop-rx" className="mb-1 block text-sm font-medium text-ink">
          Prescription
        </label>
        <Select id="shop-rx" value={rx} onChange={(e) => push({ rx: e.target.value })}>
          <option value="">All products</option>
          <option value="yes">Prescription required</option>
          <option value="no">No prescription needed</option>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => push({ in_stock: e.target.checked ? "1" : "" })}
          className="h-4 w-4 rounded border-ink/25 accent-brand"
        />
        In stock only
      </label>

      <div>
        <span className="mb-1 block text-sm font-medium text-ink">Price range (TZS)</span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
          />
          <span className="text-ink/40">–</span>
          <Input
            type="number"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div>
        <label htmlFor="shop-sort" className="mb-1 block text-sm font-medium text-ink">
          Sort by
        </label>
        <Select id="shop-sort" value={sort} onChange={(e) => push({ sort: e.target.value === "newest" ? "" : e.target.value })}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push("/shop")}>
          Clear all filters
        </Button>
      )}
    </div>
  );
}

/** Collapsible wrapper for the filters on small screens. */
export function ShopFiltersMobile({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-6 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-semibold text-ink"
      >
        <span className="inline-flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
          </svg>
          Filters
        </span>
        <svg
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="mt-3 rounded-xl border border-ink/8 bg-white p-4">{children}</div>}
    </div>
  );
}
