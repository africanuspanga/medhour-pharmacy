"use client";

import { useState } from "react";
import { trackOrder, type TrackedOrder } from "@/lib/actions/track-order";
import { formatDateTime, formatTzs, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/utils";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotFound(null);
    setOrder(null);
    try {
      const result = await trackOrder(orderNumber, phone);
      if (result.ok && result.order) setOrder(result.order);
      else setNotFound(result.message ?? "Order not found.");
    } catch {
      setNotFound("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Order number" required>
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. MED-2026-00042"
              required
            />
          </Field>
          <Field label="Phone number" required>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="The phone number used at checkout"
              required
            />
          </Field>
        </div>
        <Button type="submit" className="mt-4" disabled={loading}>
          {loading ? "Looking up…" : "Track Order"}
        </Button>
      </form>

      {notFound && (
        <div className="mt-6">
          <EmptyState title="Order not found" description={notFound} />
        </div>
      )}

      {order && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">{order.order_number}</h2>
                <p className="text-xs text-ink/50">
                  Placed {formatDateTime(order.created_at)} ·{" "}
                  {order.delivery_method === "delivery" ? "Home delivery" : "Store pickup"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={order.order_status === "completed" ? "green" : order.order_status === "cancelled" ? "red" : "amber"}>
                  {ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}
                </Badge>
                <Badge tone={order.payment_status === "paid" || order.payment_status === "cash_on_delivery" ? "green" : "amber"}>
                  {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                </Badge>
              </div>
            </div>

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
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-ink/60">Total</span>
              <span className="text-lg font-bold text-brand-dark">{formatTzs(order.total_amount)}</span>
            </div>
          </div>

          {order.history.length > 0 && (
            <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-base font-bold text-ink">Status History</h3>
              <ol className="mt-4 space-y-0" aria-label="Order status timeline">
                {order.history.map((h, i) => (
                  <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < order.history.length - 1 && (
                      <span className="absolute left-[7px] top-5 h-full w-0.5 bg-ink/10" aria-hidden />
                    )}
                    <span
                      className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
                        i === order.history.length - 1
                          ? "border-brand bg-brand"
                          : "border-ink/20 bg-white"
                      }`}
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {ORDER_STATUS_LABELS[h.status] ?? h.status}
                      </p>
                      <p className="text-xs text-ink/50">{formatDateTime(h.created_at)}</p>
                      {h.note && <p className="mt-0.5 text-xs text-ink/60">{h.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
