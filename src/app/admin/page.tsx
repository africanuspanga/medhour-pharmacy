import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatTzs } from "@/lib/utils";
import { EmptyState } from "@/components/ui/feedback";
import { OrderStatusBadge, PaymentStatusBadge } from "./status-badges";

export const metadata: Metadata = { title: "Dashboard — Admin" };

export const dynamic = "force-dynamic";

function StatCard({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const card = (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink/60">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

async function orderCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  statuses: string[]
) {
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("order_status", statuses);
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { data: products },
    newOrders,
    processingOrders,
    completedOrders,
    cancelledOrders,
    { data: paidOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, stock_quantity, low_stock_threshold")
      .is("archived_at", null),
    orderCount(supabase, ["pending"]),
    orderCount(supabase, ["confirmed", "preparing", "ready_for_pickup", "out_for_delivery"]),
    orderCount(supabase, ["completed"]),
    orderCount(supabase, ["cancelled"]),
    supabase
      .from("orders")
      .select("total_amount")
      .in("payment_status", ["paid", "cash_on_delivery"])
      .neq("order_status", "cancelled"),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total_amount, order_status, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const stockRows = products ?? [];
  const inStock = stockRows.filter((p) => p.stock_quantity > p.low_stock_threshold).length;
  const lowStock = stockRows.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold
  ).length;
  const outOfStock = stockRows.filter((p) => p.stock_quantity <= 0).length;
  const totalSales = (paidOrders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink">Dashboard</h1>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">Catalogue</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total products" value={stockRows.length} href="/admin/products" />
          <StatCard label="In stock" value={inStock} href="/admin/inventory" />
          <StatCard label="Low stock" value={lowStock} href="/admin/inventory" />
          <StatCard label="Out of stock" value={outOfStock} href="/admin/inventory" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">Orders</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="New orders" value={newOrders} href="/admin/orders?status=pending" />
          <StatCard label="Processing" value={processingOrders} href="/admin/orders" />
          <StatCard label="Completed" value={completedOrders} href="/admin/orders?status=completed" />
          <StatCard label="Cancelled" value={cancelledOrders} href="/admin/orders?status=cancelled" />
          <StatCard label="Total sales" value={formatTzs(totalSales)} href="/admin/orders" />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-brand hover:text-brand-dark">
            View all
          </Link>
        </div>
        {(recentOrders ?? []).length === 0 ? (
          <EmptyState title="No orders yet" description="New orders will appear here." />
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Order status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders ?? []).map((order) => (
                  <tr key={order.id} className="border-b border-ink/5 last:border-0 hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-brand hover:text-brand-dark"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink">{order.customer_name}</td>
                    <td className="px-4 py-3 text-ink/60">{formatDateTime(order.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-ink">{formatTzs(Number(order.total_amount))}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.order_status} /></td>
                    <td className="px-4 py-3"><PaymentStatusBadge status={order.payment_status} /></td>
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
