import type { Metadata } from "next";
import { searchProducts } from "@/lib/data";
import { SearchLive } from "@/components/storefront/search-live";

export const metadata: Metadata = {
  title: "Search",
  description: "Search medicines, healthcare and wellness products at Medhour Pharmacy.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const initialResults = query ? await searchProducts(query, 24) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Search</h1>
      <div className="mt-5">
        <SearchLive initialQuery={query} initialResults={initialResults} />
      </div>
    </div>
  );
}
