import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminProfile } from "@/lib/supabase/admin-auth";
import { formatDateTime, formatTzs } from "@/lib/utils";
import { EmptyState } from "@/components/ui/feedback";
import { OrderStatusBadge, PaymentStatusBadge } from "./status-badges";

export const metadata: Metadata = { title: "Dashboard — Admin" };

export const dynamic = "force-dynamic";

const CARD_TONES = {
  green: "bg-green-100 text-green-900",
  teal: "bg-teal-100 text-teal-900",
  rose: "bg-rose-100 text-rose-900",
  violet: "bg-violet-100 text-violet-900",
} as const;

function StatCard({
  label,
  value,
  sub,
  href,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  sub: string;
  href: string;
  tone: keyof typeof CARD_TONES;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-3xl p-5 shadow-sm transition-transform hover:-translate-y-0.5 ${CARD_TONES[tone]}`}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">{icon}</span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide opacity-60">{label}</p>
      <p className="mt-1 text-2xl font-bold sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-medium opacity-70">{sub}</p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const admin = await getAdminProfile();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const [
    { data: products },
    { count: pendingOrders },
    { count: unreadMessages },
    { data: weekOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, stock_quantity, low_stock_threshold")
      .is("archived_at", null),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("order_status", "pending"),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
    supabase
      .from("orders")
      .select("total_amount, created_at")
      .gte("created_at", weekStart.toISOString())
      .neq("order_status", "cancelled"),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total_amount, order_status, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const stockRows = products ?? [];
  const inStock = stockRows.filter((p) => p.stock_quantity > p.low_stock_threshold).length;
  const lowStock = stockRows.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold
  ).length;
  const outOfStock = stockRows.filter((p) => p.stock_quantity <= 0).length;

  // Last 7 days of sales, oldest → newest.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - (6 - i));
    return { date: d, label: d.toLocaleDateString("en-GB", { weekday: "short" }), total: 0 };
  });
  for (const order of weekOrders ?? []) {
    const created = new Date(order.created_at);
    const idx = Math.floor(
      (new Date(created).setHours(0, 0, 0, 0) - weekStart.getTime()) / 86_400_000
    );
    if (idx >= 0 && idx < 7) days[idx].total += Number(order.total_amount);
  }
  const weekTotal = days.reduce((sum, d) => sum + d.total, 0);
  const maxDay = Math.max(...days.map((d) => d.total), 1);
  const todayTotal = days[6].total;
  const todayCount = (weekOrders ?? []).filter(
    (o) => new Date(o.created_at) >= todayStart
  ).length;

  const firstName = admin?.full_name?.split(" ")[0] ?? "Admin";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">
            Welcome, {firstName}!
          </h1>
          <p className="mt-0.5 text-sm text-ink/60">
            {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z" />
          </svg>
          Add product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StatCard
          tone="green"
          label="Today's sales"
          value={formatTzs(todayTotal)}
          sub={`${todayCount} ${todayCount === 1 ? "order" : "orders"} today`}
          href="/admin/orders"
          icon={
            <svg className="h-5 w-5 text-green-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" d="M12 2v20M17 7H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H6" />
            </svg>
          }
        />
        <StatCard
          tone="teal"
          label="Active products"
          value={stockRows.length}
          sub={`${lowStock} low · ${outOfStock} out of stock`}
          href="/admin/products"
          icon={
            <svg className="h-5 w-5 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m8-14l-8 4m0 10V11m0 10l-8-4V7m8 4L4 7" />
            </svg>
          }
        />
        <StatCard
          tone="rose"
          label="Pending orders"
          value={pendingOrders ?? 0}
          sub="Waiting to be confirmed"
          href="/admin/orders?status=pending"
          icon={
            <svg className="h-5 w-5 text-rose-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 7v5l3 3" />
            </svg>
          }
        />
        <StatCard
          tone="violet"
          label="Unread messages"
          value={unreadMessages ?? 0}
          sub="From the contact form"
          href="/admin/messages"
          icon={
            <svg className="h-5 w-5 text-violet-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.9 5.3a2 2 0 0 0 2.2 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
            </svg>
          }
        />
      </div>

      {/* Sales chart + stock health */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <section className="rounded-3xl bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-ink">Sales overview</h2>
            <span className="rounded-full bg-brand-dark px-3 py-1.5 text-xs font-bold text-white">
              This week · {formatTzs(weekTotal)}
            </span>
          </div>
          <div className="mt-5 flex h-40 items-end gap-2 sm:gap-3">
            {days.map((day) => (
              <div key={day.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-ink/50 sm:text-xs">
                  {day.total > 0 ? formatTzs(day.total) : ""}
                </span>
                <div
                  className={`w-full max-w-10 rounded-t-lg ${day.total > 0 ? "bg-brand" : "bg-ink/10"}`}
                  style={{ height: `${Math.max((day.total / maxDay) * 100, 4)}%` }}
                  title={`${day.label}: ${formatTzs(day.total)}`}
                />
                <span className="text-xs font-medium text-ink/50">{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Stock health</h2>
            <Link href="/admin/inventory" className="text-sm font-medium text-brand hover:text-brand-dark">
              Inventory
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {[
              { label: "In stock", count: inStock, dot: "bg-green-500", bar: "bg-green-500" },
              { label: "Low stock", count: lowStock, dot: "bg-amber-500", bar: "bg-amber-500" },
              { label: "Out of stock", count: outOfStock, dot: "bg-red-500", bar: "bg-red-500" },
            ].map((row) => (
              <li key={row.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink/70">
                    <span className={`h-2.5 w-2.5 rounded-full ${row.dot}`} />
                    {row.label}
                  </span>
                  <span className="font-semibold text-ink">{row.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                  <div
                    className={`h-full rounded-full ${row.bar}`}
                    style={{ width: `${stockRows.length ? (row.count / stockRows.length) * 100 : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link
              href="/admin/products/new"
              className="rounded-xl bg-brand-light px-3 py-2.5 text-center text-xs font-semibold text-brand-dark transition-colors hover:bg-brand hover:text-white"
            >
              + New product
            </Link>
            <Link
              href="/admin/categories"
              className="rounded-xl bg-brand-light px-3 py-2.5 text-center text-xs font-semibold text-brand-dark transition-colors hover:bg-brand hover:text-white"
            >
              Categories
            </Link>
          </div>
        </section>
      </div>

      {/* Recent orders */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-brand hover:text-brand-dark">
            View all
          </Link>
        </div>
        {(recentOrders ?? []).length === 0 ? (
          <EmptyState title="No orders yet" description="New orders will appear here." />
        ) : (
          <>
            {/* Mobile: stacked order cards */}
            <div className="space-y-3 md:hidden">
              {(recentOrders ?? []).map((order) => (
                <div key={order.id} className="rounded-3xl bg-white p-4 shadow-sm">
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
                  <p className="mt-1 text-sm text-ink">{order.customer_name}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {formatTzs(Number(order.total_amount))}
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
            <div className="hidden overflow-x-auto rounded-3xl bg-white shadow-sm md:block">
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
          </>
        )}
      </section>
    </div>
  );
}
