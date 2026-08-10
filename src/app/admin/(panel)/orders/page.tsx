import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatTzs, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/feedback";
import { OrderStatusBadge, PaymentStatusBadge } from "../status-badges";

export const metadata: Metadata = { title: "Orders — Admin" };

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  order_items: { count: number }[];
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; page?: string }>;
}) {
  const { q, status, payment, page: pageRaw } = await searchParams;
  const page = Math.max(1, parseInt(pageRaw ?? "1", 10) || 1);
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, phone, total_amount, order_status, payment_status, created_at, order_items(count)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `order_number.ilike.%${q}%,customer_name.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }
  if (status) query = query.eq("order_status", status);
  if (payment) query = query.eq("payment_status", payment);

  const from = (page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data: orders, count } = await query;
  const rows = (orders ?? []) as unknown as OrderRow[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (payment) params.set("payment", payment);
  const exportHref = `/admin/orders/export${params.size > 0 ? `?${params.toString()}` : ""}`;
  const pageHref = (p: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    return `/admin/orders?${next.toString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">Orders</h1>
        <a href={exportHref}>
          <Button size="sm" variant="outline" type="button">
            Export CSV
          </Button>
        </a>
      </div>

      <form className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div className="w-full sm:min-w-48 sm:flex-1">
          <Input
            name="q"
            placeholder="Search order number, name or phone…"
            defaultValue={q ?? ""}
          />
        </div>
        <Select name="status" defaultValue={status ?? ""} className="w-full sm:w-auto">
          <option value="">All order statuses</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select name="payment" defaultValue={payment ?? ""} className="w-full sm:w-auto">
          <option value="">All payment statuses</option>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="outline" className="w-full sm:w-auto">
          Filter
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No orders found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <>
            {/* Mobile: stacked order cards */}
            <div className="space-y-3 md:hidden">
              {rows.map((order) => (
                <div key={order.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-brand hover:text-brand-dark"
                    >
                      {order.order_number}
                    </Link>
                    <span className="shrink-0 text-xs text-ink/50">
                      {formatDateTime(order.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink">
                    {order.customer_name} <span className="text-ink/60">· {order.phone}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {formatTzs(Number(order.total_amount))}
                      <span className="ml-1 text-xs font-normal text-ink/50">
                        · {order.order_items?.[0]?.count ?? 0} items
                      </span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <OrderStatusBadge status={order.order_status} />
                      <PaymentStatusBadge status={order.payment_status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: table */}
            <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Order status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr key={order.id} className="border-b border-ink/5 last:border-0 hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-brand hover:text-brand-dark"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{formatDateTime(order.created_at)}</td>
                    <td className="px-4 py-3 text-ink">{order.customer_name}</td>
                    <td className="px-4 py-3 text-ink/60">{order.phone}</td>
                    <td className="px-4 py-3 text-ink/60">{order.order_items?.[0]?.count ?? 0}</td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {formatTzs(Number(order.total_amount))}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.order_status} />
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={order.payment_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>

          <div className="flex items-center justify-between text-sm text-ink/60">
            <span>
              Page {page} of {totalPages} ({count ?? 0} orders)
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={pageHref(page - 1)}>
                  <Button size="sm" variant="outline" type="button">
                    Previous
                  </Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={pageHref(page + 1)}>
                  <Button size="sm" variant="outline" type="button">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
