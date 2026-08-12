import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/feedback";
import { Pagination } from "@/components/storefront/pagination";
import { StockAdjustForm } from "./stock-adjust-form";

export const metadata: Metadata = { title: "Inventory — Admin" };

export const dynamic = "force-dynamic";

/** The catalogue runs to several hundred lines — page it. */
const PER_PAGE = 50;

const MOVEMENT_LABELS: Record<string, string> = {
  order_placed: "Order placed",
  order_cancelled: "Order cancelled",
  manual_adjustment: "Manual adjustment",
  restock: "Restock",
};

interface ProductRow {
  id: string;
  name: string;
  internal_name: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
}

interface MovementRow {
  id: string;
  change: number;
  movement_type: string;
  reason: string | null;
  created_at: string;
  product: { name: string } | null;
  admin: { full_name: string | null } | null;
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; low?: string }>;
}) {
  const { q, page: pageParam, low } = await searchParams;
  const page = Math.max(Number(pageParam) || 1, 1);
  const supabase = await createClient();

  let productQuery = supabase
    .from("products")
    .select("id, name, internal_name, stock_quantity, low_stock_threshold", {
      count: "exact",
    })
    .is("archived_at", null)
    .order("stock_quantity", { ascending: true })
    .order("name");
  if (q) {
    const term = q.replaceAll(",", " ").trim();
    productQuery = productQuery.or(
      `name.ilike.%${term}%,internal_name.ilike.%${term}%,sku.ilike.%${term}%`
    );
  }
  // "Needs restocking" — anything at or below its own low-stock threshold.
  if (low) productQuery = productQuery.lte("stock_quantity", 10);

  const from = (page - 1) * PER_PAGE;
  const [{ data: products, count }, { data: movements }] = await Promise.all([
    productQuery.range(from, from + PER_PAGE - 1),
    supabase
      .from("inventory_movements")
      .select("id, change, movement_type, reason, created_at, product:products(name), admin:profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const rows = (products ?? []) as ProductRow[];
  const movementRows = (movements ?? []) as unknown as MovementRow[];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PER_PAGE);
  const pageParams: Record<string, string> = {};
  if (q) pageParams.q = q;
  if (low) pageParams.low = low;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Inventory</h1>
          <p className="text-sm text-ink/60">
            {total.toLocaleString()} {total === 1 ? "product" : "products"}
            {totalPages > 1 && ` — page ${page} of ${totalPages}`}
            {low && " — low stock only"}
          </p>
        </div>
        <form className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Input
            name="q"
            placeholder="Search name, stock name or SKU…"
            defaultValue={q ?? ""}
            className="flex-1 sm:w-56"
          />
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              name="low"
              value="1"
              defaultChecked={low === "1"}
              className="h-4 w-4 rounded border-ink/20 accent-brand"
            />
            Low stock only
          </label>
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No products found" description="Try a different search." />
      ) : (
        <>
          {/* Mobile: stacked product cards */}
          <div className="space-y-3 md:hidden">
            {rows.map((product) => {
              const out = product.stock_quantity <= 0;
              const low = !out && product.stock_quantity <= product.low_stock_threshold;
              return (
                <div
                  key={product.id}
                  className={`rounded-2xl p-4 shadow-sm ${
                    out ? "bg-red-50" : low ? "bg-amber-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{product.name}</p>
                      {product.internal_name && (
                        <p className="truncate text-xs text-ink/40">
                          {product.internal_name}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0">
                      {out ? (
                        <Badge tone="red">Out of stock</Badge>
                      ) : low ? (
                        <Badge tone="amber">Low — {product.stock_quantity}</Badge>
                      ) : (
                        <span className="text-sm text-ink">{product.stock_quantity} in stock</span>
                      )}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink/60">
                    Low-stock threshold: {product.low_stock_threshold}
                  </p>
                  <div className="mt-3">
                    <StockAdjustForm productId={product.id} />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Low-stock threshold</th>
                <th className="px-4 py-3 font-medium">Adjust stock</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => {
                const out = product.stock_quantity <= 0;
                const low = !out && product.stock_quantity <= product.low_stock_threshold;
                return (
                  <tr
                    key={product.id}
                    className={`border-b border-ink/5 last:border-0 ${
                      out ? "bg-red-50" : low ? "bg-amber-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{product.name}</span>
                      {product.internal_name && (
                        <span className="block text-xs text-ink/40">
                          {product.internal_name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {out ? (
                        <Badge tone="red">Out of stock</Badge>
                      ) : low ? (
                        <Badge tone="amber">Low — {product.stock_quantity}</Badge>
                      ) : (
                        <span className="text-ink">{product.stock_quantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink/60">{product.low_stock_threshold}</td>
                    <td className="px-4 py-3">
                      <StockAdjustForm productId={product.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          <Pagination page={page} totalPages={totalPages} searchParams={pageParams} />
        </>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Recent stock movements
        </h2>
        {movementRows.length === 0 ? (
          <EmptyState title="No movements yet" description="Stock changes will be recorded here." />
        ) : (
          <>
            {/* Mobile: stacked movement cards */}
            <div className="space-y-3 md:hidden">
              {movementRows.map((movement) => (
                <div key={movement.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 text-sm font-medium text-ink">
                      {movement.product?.name ?? "—"}
                    </p>
                    <span
                      className={`shrink-0 text-sm font-medium ${
                        movement.change > 0 ? "text-brand-dark" : "text-red-600"
                      }`}
                    >
                      {movement.change > 0 ? `+${movement.change}` : movement.change}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink/60">
                    {MOVEMENT_LABELS[movement.movement_type] ?? movement.movement_type}
                    {movement.reason ? ` · ${movement.reason}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-ink/50">
                    {formatDateTime(movement.created_at)} · {movement.admin?.full_name ?? "—"}
                  </p>
                </div>
              ))}
            </div>
            {/* Desktop: table */}
            <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Change</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">By</th>
                </tr>
              </thead>
              <tbody>
                {movementRows.map((movement) => (
                  <tr key={movement.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 text-ink/60">{formatDateTime(movement.created_at)}</td>
                    <td className="px-4 py-3 text-ink">{movement.product?.name ?? "—"}</td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        movement.change > 0 ? "text-brand-dark" : "text-red-600"
                      }`}
                    >
                      {movement.change > 0 ? `+${movement.change}` : movement.change}
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {MOVEMENT_LABELS[movement.movement_type] ?? movement.movement_type}
                    </td>
                    <td className="px-4 py-3 text-ink/60">{movement.reason ?? "—"}</td>
                    <td className="px-4 py-3 text-ink/60">{movement.admin?.full_name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
