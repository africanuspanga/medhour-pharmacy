import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatTzs } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/feedback";
import { ProductImage } from "@/components/product/product-image";
import {
  archiveProduct,
  setProductActive,
  unarchiveProduct,
} from "@/lib/actions/admin/products";

export const metadata: Metadata = { title: "Products — Admin" };

export const dynamic = "force-dynamic";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_featured: boolean;
  requires_prescription: boolean;
  is_active: boolean;
  archived_at: string | null;
  category: { name: string } | null;
  images: { image_url: string }[] | null;
}

function StockCell({ product }: { product: ProductRow }) {
  if (product.stock_quantity <= 0) {
    return <Badge tone="red">Out of stock</Badge>;
  }
  if (product.stock_quantity <= product.low_stock_threshold) {
    return <Badge tone="amber">Low — {product.stock_quantity}</Badge>;
  }
  return <span className="text-ink">{product.stock_quantity}</span>;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; archived?: string }>;
}) {
  const { q, category, archived } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, name, price, sale_price, stock_quantity, low_stock_threshold, is_featured, requires_prescription, is_active, archived_at, category:categories(name), images:product_images(image_url)"
    )
    .order("name");

  if (!archived) query = query.is("archived_at", null);
  if (q) query = query.ilike("name", `%${q}%`);
  if (category) query = query.eq("category_id", category);

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);

  const rows = (products ?? []) as unknown as ProductRow[];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">Products</h1>
        <Link href="/admin/products/new">
          <Button size="sm">Add product</Button>
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-2 rounded-2xl bg-white p-3 shadow-sm">
        <div className="min-w-40 flex-1">
          <Input name="q" placeholder="Search by name…" defaultValue={q ?? ""} />
        </div>
        <Select name="category" defaultValue={category ?? ""} className="w-auto">
          <option value="">All categories</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 px-2 py-2 text-sm text-ink/70">
          <input
            type="checkbox"
            name="archived"
            value="1"
            defaultChecked={archived === "1"}
            className="h-4 w-4 rounded border-ink/20 accent-brand"
          />
          Show archived
        </label>
        <Button type="submit" size="sm" variant="outline">
          Filter
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try a different search, or add a new product."
          action={
            <Link href="/admin/products/new">
              <Button size="sm">Add product</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium">Rx</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-ink/5 last:border-0 hover:bg-surface/60"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={product.images?.[0]?.image_url}
                        alt={product.name}
                        className="h-10 w-10 shrink-0 rounded-lg"
                        sizes="40px"
                      />
                      <div>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium text-ink hover:text-brand"
                        >
                          {product.name}
                        </Link>
                        {product.archived_at && (
                          <Badge tone="grey" className="ml-2">
                            Archived
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{product.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">
                      {formatTzs(product.sale_price ?? product.price)}
                    </span>
                    {product.sale_price != null && (
                      <span className="ml-1 text-xs text-ink/40 line-through">
                        {formatTzs(product.price)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StockCell product={product} />
                  </td>
                  <td className="px-4 py-3 text-ink/60">{product.is_featured ? "Yes" : "—"}</td>
                  <td className="px-4 py-3">
                    {product.requires_prescription ? <Badge tone="blue">Rx</Badge> : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={setProductActive.bind(null, product.id, !product.is_active)}>
                      <button
                        type="submit"
                        title={product.is_active ? "Click to deactivate" : "Click to activate"}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          product.is_active ? "bg-brand" : "bg-ink/20"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            product.is_active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button size="sm" variant="outline" type="button">
                          Edit
                        </Button>
                      </Link>
                      {product.archived_at ? (
                        <form action={unarchiveProduct.bind(null, product.id)}>
                          <Button size="sm" variant="ghost" type="submit">
                            Unarchive
                          </Button>
                        </form>
                      ) : (
                        <form action={archiveProduct.bind(null, product.id)}>
                          <Button size="sm" variant="ghost" type="submit" className="text-red-600">
                            Archive
                          </Button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
