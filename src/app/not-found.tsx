import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
      <p className="text-6xl font-bold tracking-tight text-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink sm:text-3xl">Page not found</h1>
      <p className="mt-3 leading-relaxed text-ink/60">
        Sorry, we couldn&apos;t find the page you were looking for. It may have been moved or no
        longer exists.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Go home
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-full border border-brand px-6 py-3 text-base font-semibold text-brand transition-colors hover:bg-brand-light"
        >
          Browse the shop
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-ink transition-colors hover:bg-surface"
        >
          Search products
        </Link>
      </div>
    </div>
  );
}
