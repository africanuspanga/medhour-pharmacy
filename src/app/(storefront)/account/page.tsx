import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { formatDate, formatTzs } from "@/lib/utils";
import { EmptyState } from "@/components/ui/feedback";
import { OrderStatusBadge } from "@/components/account/status-badges";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your Medhour Pharmacy orders and their delivery status.",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user!.id)
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you place an order, it will show up here with live status updates."
        action={
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Browse the Shop
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="block rounded-2xl border border-ink/10 bg-white p-4 transition-shadow hover:shadow-md sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-ink">{order.order_number}</p>
              <p className="text-sm text-ink/60">{formatDate(order.created_at)}</p>
            </div>
            <OrderStatusBadge status={order.order_status} />
          </div>
          <p className="mt-3 text-sm font-medium text-ink">{formatTzs(order.total_amount)}</p>
        </Link>
      ))}
    </div>
  );
}
