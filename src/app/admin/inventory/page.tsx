import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/feedback";
import { StockAdjustForm } from "./stock-adjust-form";

export const metadata: Metadata = { title: "Inventory — Admin" };

export const dynamic = "force-dynamic";

const MOVEMENT_LABELS: Record<string, string> = {
  order_placed: "Order placed",
  order_cancelled: "Order cancelled",
  manual_adjustment: "Manual adjustment",
  restock: "Restock",
};

interface ProductRow {
  id: string;
  name: string;
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
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let productQuery = supabase
    .from("products")
    .select("id, name, stock_quantity, low_stock_threshold")
    .is("archived_at", null)
    .order("stock_quantity", { ascending: true })
    .order("name");
  if (q) productQuery = productQuery.ilike("name", `%${q}%`);

  const [{ data: products }, { data: movements }] = await Promise.all([
    productQuery,
    supabase
      .from("inventory_movements")
      .select("id, change, movement_type, reason, created_at, product:products(name), admin:profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const rows = (products ?? []) as ProductRow[];
  const movementRows = (movements ?? []) as unknown as MovementRow[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">Inventory</h1>
        <form className="flex gap-2">
          <Input name="q" placeholder="Search product…" defaultValue={q ?? ""} className="w-56" />
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No products found" description="Try a different search." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
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
                    <td className="px-4 py-3 font-medium text-ink">{product.name}</td>
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
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Recent stock movements
        </h2>
        {movementRows.length === 0 ? (
          <EmptyState title="No movements yet" description="Stock changes will be recorded here." />
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
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
        )}
      </section>
    </div>
  );
}
