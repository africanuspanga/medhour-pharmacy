import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem, OrderStatusHistory, Product } from "@/lib/types";
import { formatDateTime, formatTzs, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/utils";
import { WHATSAPP_URL } from "@/lib/constants";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/account/status-badges";
import { ReorderButton, type ReorderItem } from "@/components/account/reorder-button";

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user!.id)
    .maybeSingle();
  if (!order) notFound();
  const typedOrder = order as Order;

  const [{ data: items }, { data: history }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", typedOrder.id).order("created_at"),
    supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", typedOrder.id)
      .order("created_at", { ascending: false }),
  ]);
  const orderItems = (items ?? []) as OrderItem[];
  const statusHistory = (history ?? []) as OrderStatusHistory[];

  // Fetch the products behind the order items for the Reorder button.
  // RLS hides archived/inactive products, so those are skipped below with a note.
  const productIds = [...new Set(orderItems.map((i) => i.product_id).filter((x): x is string => !!x))];
  const { data: products } = productIds.length
    ? await supabase
        .from("products")
        .select("*, images:product_images(*)")
        .in("id", productIds)
    : { data: [] };
  const productById = new Map(((products ?? []) as unknown as Product[]).map((p) => [p.id, p]));

  const reorderable: ReorderItem[] = [];
  let skippedCount = 0;
  for (const item of orderItems) {
    const product = item.product_id ? productById.get(item.product_id) : undefined;
    if (product && product.is_active && product.stock_quantity > 0) {
      reorderable.push({ product, quantity: item.quantity });
    } else {
      skippedCount++;
    }
  }

  const whatsappHref = `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hello Medhour Pharmacy, I'd like to follow up on my order ${typedOrder.order_number}.`
  )}`;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/account" className="text-sm font-medium text-brand hover:underline">
          ← Back to orders
        </Link>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">{typedOrder.order_number}</h2>
            <p className="mt-1 text-sm text-ink/60">Placed {formatDateTime(typedOrder.created_at)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={typedOrder.order_status} />
            <PaymentStatusBadge status={typedOrder.payment_status} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ReorderButton items={reorderable} />
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand-light"
          >
            Ask about this order on WhatsApp
          </a>
        </div>
        {skippedCount > 0 && (
          <p className="mt-3 text-xs text-ink/50">
            {skippedCount === 1
              ? "One item from this order is no longer available and was skipped for reordering."
              : `${skippedCount} items from this order are no longer available and were skipped for reordering.`}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
        <h3 className="font-semibold text-ink">Items</h3>
        <ul className="mt-3 divide-y divide-ink/10">
          {orderItems.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{item.product_name}</p>
                <p className="text-xs text-ink/60">
                  {item.pack_size ? `${item.pack_size} · ` : ""}
                  {formatTzs(item.unit_price)} × {item.quantity}
                  {item.requires_prescription ? " · Prescription required" : ""}
                </p>
              </div>
              <p className="text-sm font-medium text-ink">{formatTzs(item.line_total)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/60">Subtotal</dt>
            <dd className="text-ink">{formatTzs(typedOrder.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Delivery fee</dt>
            <dd className="text-ink">{formatTzs(typedOrder.delivery_fee)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt className="text-ink">Total</dt>
            <dd className="text-ink">{formatTzs(typedOrder.total_amount)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
        <h3 className="font-semibold text-ink">
          {typedOrder.delivery_method === "delivery" ? "Delivery" : "Pickup"} details
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Recipient</dt>
            <dd className="text-right text-ink">{typedOrder.customer_name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Phone</dt>
            <dd className="text-right text-ink">{typedOrder.phone}</dd>
          </div>
          {typedOrder.delivery_method === "delivery" && (
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink/60">Address</dt>
              <dd className="text-right text-ink">
                {[typedOrder.delivery_address, typedOrder.landmark, typedOrder.district, typedOrder.region]
                  .filter(Boolean)
                  .join(", ")}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Payment</dt>
            <dd className="text-right text-ink">
              {PAYMENT_METHOD_LABELS[typedOrder.payment_method] ?? typedOrder.payment_method}
            </dd>
          </div>
          {typedOrder.customer_notes && (
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink/60">Your notes</dt>
              <dd className="text-right text-ink">{typedOrder.customer_notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {statusHistory.length > 0 && (
        <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
          <h3 className="font-semibold text-ink">Status history</h3>
          <ol className="mt-4 space-y-4">
            {statusHistory.map((entry) => (
              <li key={entry.id} className="flex gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-ink">
                    {ORDER_STATUS_LABELS[entry.status] ?? entry.status}
                  </p>
                  <p className="text-xs text-ink/60">{formatDateTime(entry.created_at)}</p>
                  {entry.note && <p className="mt-1 text-sm text-ink/70">{entry.note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
