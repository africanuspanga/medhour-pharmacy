import type { Metadata } from "next";
import { getCategories } from "@/lib/data";
import { CategoryCard } from "@/components/category/category-card";
import { EmptyState } from "@/components/ui/feedback";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse product categories at Medhour Pharmacy — medicines, personal care, mother and baby, vitamins and more.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Categories</h1>
      <p className="mt-1 text-sm text-ink/60">Browse our range of healthcare products by category.</p>

      {categories.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Categories coming soon" description="We are stocking our shelves — check back shortly." />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      )}
    </div>
  );
}
