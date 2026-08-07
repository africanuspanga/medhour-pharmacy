import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  formatDateTime,
  formatTzs,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/utils";
import type { AdminNote, Order, OrderItem, OrderStatusHistory } from "@/lib/types";
import { OrderStatusBadge, PaymentStatusBadge } from "../../status-badges";
import {
  AddNoteForm,
  OrderStatusForm,
  PaymentStatusForm,
  PrintButton,
} from "./order-controls";

export const metadata: Metadata = { title: "Order detail — Admin" };

export const dynamic = "force-dynamic";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-ink/50">{label}</span>
      <span className="min-w-0 break-words text-right text-ink">{value ?? "—"}</span>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!order) notFound();

  const [{ data: items }, { data: history }, { data: notes }, { data: prescription }] =
    await Promise.all([
      supabase.from("order_items").select("*").eq("order_id", id).order("created_at"),
      supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("admin_notes")
        .select("*, admin:profiles(full_name)")
        .eq("order_id", id)
        .order("created_at", { ascending: false }),
      order.prescription_id
        ? supabase
            .from("prescriptions")
            .select("id, status, customer_name")
            .eq("id", order.prescription_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const typedOrder = order as Order;
  const typedItems = (items ?? []) as OrderItem[];
  const typedHistory = (history ?? []) as OrderStatusHistory[];
  const typedNotes = (notes ?? []) as (AdminNote & { admin: { full_name: string | null } | null })[];

  const isDelivery = typedOrder.delivery_method === "delivery";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <Link href="/admin/orders" className="text-sm text-ink/60 hover:text-brand">
            ← Orders
          </Link>
          <h1 className="mt-1 text-xl font-bold text-ink">{typedOrder.order_number}</h1>
        </div>
        <PrintButton />
      </div>

      {/* Print-friendly summary (only visible when printing) */}
      <section className="hidden rounded-2xl bg-white p-6 print:block">
        <h1 className="text-lg font-bold text-ink">Medhour Pharmacy — Order {typedOrder.order_number}</h1>
        <p className="text-sm text-ink/60">{formatDateTime(typedOrder.created_at)}</p>
        <div className="mt-4 text-sm">
          <p><strong>Customer:</strong> {typedOrder.customer_name} — {typedOrder.phone}</p>
          {typedOrder.email && <p><strong>Email:</strong> {typedOrder.email}</p>}
          <p>
            <strong>Fulfilment:</strong> {isDelivery ? "Delivery" : "Pickup"}
            {isDelivery && typedOrder.delivery_address
              ? ` — ${typedOrder.delivery_address}${typedOrder.district ? `, ${typedOrder.district}` : ""}${typedOrder.region ? `, ${typedOrder.region}` : ""}`
              : ""}
          </p>
          <p><strong>Payment:</strong> {PAYMENT_METHOD_LABELS[typedOrder.payment_method] ?? typedOrder.payment_method} ({PAYMENT_STATUS_LABELS[typedOrder.payment_status] ?? typedOrder.payment_status})</p>
          <p><strong>Status:</strong> {ORDER_STATUS_LABELS[typedOrder.order_status] ?? typedOrder.order_status}</p>
        </div>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-1">Item</th>
              <th className="py-1">Qty</th>
              <th className="py-1">Unit price</th>
              <th className="py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {typedItems.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-1">{item.product_name}{item.pack_size ? ` (${item.pack_size})` : ""}</td>
                <td className="py-1">{item.quantity}</td>
                <td className="py-1">{formatTzs(Number(item.unit_price))}</td>
                <td className="py-1">{formatTzs(Number(item.line_total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-right text-sm">
          Subtotal {formatTzs(Number(typedOrder.subtotal))} · Delivery {formatTzs(Number(typedOrder.delivery_fee))} ·{" "}
          <strong>Total {formatTzs(Number(typedOrder.total_amount))}</strong>
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3 print:hidden">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={typedOrder.order_status} />
              <PaymentStatusBadge status={typedOrder.payment_status} />
              <span className="text-sm text-ink/50">{formatDateTime(typedOrder.created_at)}</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/50">Customer</h2>
                <InfoRow label="Name" value={typedOrder.customer_name} />
                <InfoRow label="Phone" value={typedOrder.phone} />
                <InfoRow label="Email" value={typedOrder.email} />
                <InfoRow
                  label="Payment method"
                  value={PAYMENT_METHOD_LABELS[typedOrder.payment_method] ?? typedOrder.payment_method}
                />
                {typedOrder.customer_notes && (
                  <InfoRow label="Customer notes" value={typedOrder.customer_notes} />
                )}
              </div>
              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/50">
                  {isDelivery ? "Delivery" : "Pickup"}
                </h2>
                {isDelivery ? (
                  <>
                    <InfoRow label="Region" value={typedOrder.region} />
                    <InfoRow label="District" value={typedOrder.district} />
                    <InfoRow label="Address" value={typedOrder.delivery_address} />
                    <InfoRow label="Landmark" value={typedOrder.landmark} />
                  </>
                ) : (
                  <p className="text-sm text-ink/60">Customer will pick up at the pharmacy.</p>
                )}
                {prescription && (
                  <div className="mt-3">
                    <Link
                      href={`/admin/prescriptions/${prescription.id}`}
                      className="text-sm font-medium text-brand hover:text-brand-dark"
                    >
                      View linked prescription →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Unit price</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {typedItems.map((item) => (
                  <tr key={item.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{item.product_name}</span>
                      {item.pack_size && <span className="text-ink/50"> — {item.pack_size}</span>}
                      {item.requires_prescription && (
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          Rx
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink/60">{formatTzs(Number(item.unit_price))}</td>
                    <td className="px-4 py-3 text-ink/60">{item.quantity}</td>
                    <td className="px-4 py-3 font-medium text-ink">{formatTzs(Number(item.line_total))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-ink/10 text-sm">
                  <td colSpan={3} className="px-4 py-2 text-right text-ink/60">Subtotal</td>
                  <td className="px-4 py-2 text-ink">{formatTzs(Number(typedOrder.subtotal))}</td>
                </tr>
                <tr className="text-sm">
                  <td colSpan={3} className="px-4 py-2 text-right text-ink/60">Delivery fee</td>
                  <td className="px-4 py-2 text-ink">{formatTzs(Number(typedOrder.delivery_fee))}</td>
                </tr>
                <tr className="text-sm font-bold">
                  <td colSpan={3} className="px-4 py-2 text-right text-ink">Total</td>
                  <td className="px-4 py-2 text-ink">{formatTzs(Number(typedOrder.total_amount))}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
              Status timeline
            </h2>
            {typedHistory.length === 0 ? (
              <p className="text-sm text-ink/60">No status changes recorded yet.</p>
            ) : (
              <ol className="space-y-3">
                {typedHistory.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    <div>
                      <span className="font-medium text-ink">
                        {ORDER_STATUS_LABELS[entry.status] ?? entry.status}
                      </span>
                      <span className="ml-2 text-ink/50">{formatDateTime(entry.created_at)}</span>
                      {entry.note && <p className="text-ink/60">{entry.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <OrderStatusForm orderId={id} currentStatus={typedOrder.order_status} />
          <PaymentStatusForm orderId={id} currentStatus={typedOrder.payment_status} />

          <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
              Internal notes
            </h2>
            {typedNotes.length === 0 ? (
              <p className="text-sm text-ink/60">No notes yet.</p>
            ) : (
              <ul className="space-y-3">
                {typedNotes.map((note) => (
                  <li key={note.id} className="rounded-lg bg-surface p-3 text-sm">
                    <p className="text-ink">{note.note}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      {note.admin?.full_name ?? "Admin"} · {formatDateTime(note.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <AddNoteForm orderId={id} />
          </section>
        </div>
      </div>
    </div>
  );
}
