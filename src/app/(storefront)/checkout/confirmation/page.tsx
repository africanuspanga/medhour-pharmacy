import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WHATSAPP_URL, SITE } from "@/lib/constants";
import { formatTzs, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/lib/types";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Thank you for your order at Medhour Pharmacy.",
  robots: { index: false },
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  // Guest-safe lookup: the RLS-bound server client only returns the order when
  // the caller is allowed to see it (logged-in owner). Otherwise we show a
  // generic confirmation with the order number from the URL.
  let order: Order | null = null;
  if (orderNumber) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("order_number, subtotal, delivery_fee, total_amount, payment_method, payment_status, order_status, delivery_method, items:order_items(product_name, pack_size, quantity, unit_price, line_total)")
      .eq("order_number", orderNumber)
      .maybeSingle();
    order = (data as unknown as Order) ?? null;
  }

  const whatsappHref = `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hello ${SITE.name}, I would like to follow up on my order${orderNumber ? ` ${orderNumber}` : ""}.`
  )}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 lg:px-8">
      <div className="rounded-3xl border border-ink/8 bg-white p-6 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand-dark">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink sm:text-3xl">Thank you — order received!</h1>
        <p className="mt-2 text-sm text-ink/60">
          Our pharmacy team will review your order and contact you shortly to confirm.
        </p>

        {orderNumber && (
          <p className="mt-5 inline-block rounded-full bg-surface px-5 py-2 text-sm">
            Order number: <span className="font-bold text-ink">{orderNumber}</span>
          </p>
        )}

        {order ? (
          <div className="mt-8 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="amber">{ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}</Badge>
              <Badge tone={order.payment_status === "cash_on_delivery" ? "green" : "amber"}>
                {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
              </Badge>
              <Badge tone="grey">{PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}</Badge>
            </div>

            {order.items && order.items.length > 0 && (
              <ul className="mt-5 space-y-2 text-sm">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 border-b border-ink/8 pb-2">
                    <span className="min-w-0 text-ink/80">
                      <span className="font-medium">{item.product_name}</span>
                      <span className="text-xs text-ink/50">
                        {" "}× {item.quantity}
                        {item.pack_size ? ` · ${item.pack_size}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold text-ink">{formatTzs(item.line_total)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-ink/60">Total</span>
              <span className="text-lg font-bold text-brand-dark">{formatTzs(order.total_amount)}</span>
            </div>
            <p className="mt-2 text-xs text-ink/50">
              {order.payment_status === "cash_on_delivery"
                ? "Pay in cash when your order arrives."
                : order.payment_method === "mobile_money"
                  ? "Mobile Money payment is pending — we will confirm it before fulfilling your order."
                  : "Pay when you collect your order at the pharmacy."}
            </p>
          </div>
        ) : (
          orderNumber && (
            <p className="mt-6 rounded-xl bg-surface px-4 py-3 text-sm text-ink/60">
              Keep your order number safe — you can use it with your phone number on the{" "}
              <Link href="/track-order" className="font-semibold text-brand hover:text-brand-dark">
                order tracking page
              </Link>{" "}
              to check your order status.
            </p>
          )
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2a9.9 9.9 0 00-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1012.04 2zm0 1.8a8.1 8.1 0 110 16.2 8 8 0 01-4.1-1.1l-.3-.2-2.9.9 1-2.8-.2-.3a8.1 8.1 0 016.5-12.7zm-3.4 4c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.4.9 2.9.7 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4l-2-.9c-.3-.2-.5-.2-.7.1l-1 1.2c-.2.2-.4.3-.7.1a9.5 9.5 0 01-2.7-1.7 10 10 0 01-1.9-2.3c-.2-.3 0-.5.1-.7l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5L9.6 8.2c-.2-.4-.4-.4-.6-.4z" />
            </svg>
            Follow up on WhatsApp
          </a>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand-light"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
