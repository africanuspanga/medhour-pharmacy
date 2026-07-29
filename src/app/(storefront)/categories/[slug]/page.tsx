import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/lib/data";
import { SITE } from "@/lib/constants";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/feedback";
import { Pagination } from "@/components/storefront/pagination";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.is_active) return { title: "Category not found" };
  return {
    title: category.name,
    description:
      category.description ?? `Shop ${category.name} products at ${SITE.name}, Dar es Salaam.`,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.is_active) notFound();

  const page = Math.max(Number(sp.page) || 1, 1);
  const result = await getProducts({ category: slug, page });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink/50">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/categories" className="hover:text-brand">
              Categories
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-ink" aria-current="page">
            {category.name}
          </li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold text-ink sm:text-3xl">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-sm text-ink/60">{category.description}</p>}
      <p className="mt-2 text-sm text-ink/60">
        {result.total} {result.total === 1 ? "product" : "products"}
      </p>

      <div className="mt-6">
        {result.products.length === 0 ? (
          <EmptyState
            title="No products in this category yet"
            description="We are adding products — check back shortly or browse the full shop."
            action={
              <Link href="/shop" className="text-sm font-semibold text-brand hover:text-brand-dark">
                Browse the shop
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {result.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Pagination page={result.page} totalPages={result.totalPages} searchParams={{}} />
          </>
        )}
      </div>
    </div>
  );
}
