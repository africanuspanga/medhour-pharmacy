"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState, Spinner } from "@/components/ui/feedback";
import { Input } from "@/components/ui/field";

/** Live search — fetches /api/search with a 300ms debounce, no full navigation. */
export function SearchLive({
  initialQuery,
  initialResults,
}: {
  initialQuery: string;
  initialResults: Product[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const trimmed = query.trim();
    if (trimmed === initialQuery) return; // server-provided results are shown
    debounce.current = setTimeout(async () => {
      const id = ++requestId.current;
      // Keep the URL in sync (shareable) without re-rendering the server page.
      router.replace(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search", { scroll: false });
      if (!trimmed) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error(`search failed: ${res.status}`);
        const data = (await res.json()) as { products: Product[] };
        if (id === requestId.current) setResults(data.products ?? []);
      } catch {
        if (id === requestId.current) setResults([]);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 300);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const trimmedQuery = query.trim();
  // Show the server-provided results whenever the query matches the URL's query.
  const displayed = trimmedQuery === initialQuery ? initialResults : results;
  const displayedLoading = trimmedQuery === initialQuery ? false : loading;

  return (
    <div>
      <div className="relative max-w-xl">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search medicines, health products…"
          aria-label="Search products"
          autoFocus
          className="py-3 pl-11 pr-10 text-base"
        />
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
        </svg>
        {displayedLoading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            <Spinner className="h-4 w-4" />
          </span>
        )}
      </div>

      <p className="mt-4 text-sm text-ink/60" aria-live="polite">
        {trimmedQuery
          ? `${displayed.length} ${displayed.length === 1 ? "result" : "results"} for “${trimmedQuery}”`
          : "Type to search our products."}
      </p>

      <div className="mt-6">
        {trimmedQuery && displayed.length === 0 && !displayedLoading ? (
          <EmptyState
            title="No products found"
            description={`We could not find anything matching “${trimmedQuery}”. Try a different search term or browse the shop.`}
            action={
              <Link href="/shop" className="text-sm font-semibold text-brand hover:text-brand-dark">
                Browse the shop
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {displayed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
