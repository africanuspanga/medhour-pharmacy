import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { ProductImage } from "@/components/product/product-image";
import type { Category } from "@/lib/types";
import { CategoryForm, CategoryImageUpload } from "./category-form";

export const metadata: Metadata = { title: "Categories — Admin" };

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");

  const rows = (categories ?? []) as Category[];
  const editing = edit ? rows.find((c) => c.id === edit) : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">Categories</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <CategoryForm key={editing?.id ?? "new"} category={editing} />
          {editing && <CategoryImageUpload category={editing} />}
        </div>

        <div>
          {rows.length === 0 ? (
            <EmptyState title="No categories yet" description="Create your first category with the form." />
          ) : (
            <>
              {/* Mobile: stacked category cards */}
              <div className="space-y-3 md:hidden">
                {rows.map((category) => (
                  <div key={category.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={category.image_url}
                        alt={category.name}
                        className="h-9 w-9 shrink-0 rounded-lg"
                        sizes="36px"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{category.name}</p>
                        <p className="truncate text-xs text-ink/60">
                          {category.slug} · Sort {category.sort_order}
                        </p>
                      </div>
                      {category.is_active ? (
                        <Badge tone="green">Active</Badge>
                      ) : (
                        <Badge tone="grey">Hidden</Badge>
                      )}
                    </div>
                    <div className="mt-3">
                      <Link href={`/admin/categories?edit=${category.id}`}>
                        <Button size="sm" variant="outline" type="button" className="w-full">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: table */}
              <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">Sort</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((category) => (
                    <tr key={category.id} className="border-b border-ink/5 last:border-0 hover:bg-surface/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            src={category.image_url}
                            alt={category.name}
                            className="h-9 w-9 shrink-0 rounded-lg"
                            sizes="36px"
                          />
                          <span className="font-medium text-ink">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink/60">{category.slug}</td>
                      <td className="px-4 py-3 text-ink/60">{category.sort_order}</td>
                      <td className="px-4 py-3">
                        {category.is_active ? (
                          <Badge tone="green">Active</Badge>
                        ) : (
                          <Badge tone="grey">Hidden</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/categories?edit=${category.id}`}>
                          <Button size="sm" variant="outline" type="button">
                            Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
