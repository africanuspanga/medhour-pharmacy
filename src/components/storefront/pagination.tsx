import Link from "next/link";
import { cn } from "@/lib/utils";

/** Numbered prev/next pagination that preserves the current query string. */
export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  };

  // Window of page numbers around the current page.
  const pages: number[] = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  for (let p = start; p <= Math.min(totalPages, start + 4); p++) pages.push(p);

  const linkClass = (active: boolean) =>
    cn(
      "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors",
      active ? "bg-brand text-white" : "border border-ink/15 text-ink hover:bg-brand-light"
    );

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass(false)} aria-label="Previous page">
          ← Prev
        </Link>
      ) : (
        <span className={cn(linkClass(false), "cursor-not-allowed opacity-40")} aria-hidden>
          ← Prev
        </span>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          className={linkClass(p === page)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={linkClass(false)} aria-label="Next page">
          Next →
        </Link>
      ) : (
        <span className={cn(linkClass(false), "cursor-not-allowed opacity-40")} aria-hidden>
          Next →
        </span>
      )}
    </nav>
  );
}
