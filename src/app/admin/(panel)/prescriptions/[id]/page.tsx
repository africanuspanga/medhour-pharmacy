import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { Prescription } from "@/lib/types";
import { PrescriptionStatusBadge } from "../../status-badges";
import {
  LinkOrderForm,
  PrescriptionNotesForm,
  PrescriptionStatusForm,
  ViewFileButton,
} from "./prescription-controls";

export const metadata: Metadata = { title: "Prescription detail — Admin" };

export const dynamic = "force-dynamic";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-ink/50">{label}</span>
      <span className="min-w-0 break-words text-right text-ink">{value ?? "—"}</span>
    </div>
  );
}

export default async function AdminPrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: prescription } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!prescription) notFound();

  const typed = prescription as Prescription;

  const { data: linkedOrder } = typed.order_id
    ? await supabase
        .from("orders")
        .select("id, order_number")
        .eq("id", typed.order_id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/prescriptions" className="text-sm text-ink/60 hover:text-brand">
          ← Prescriptions
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-ink">Prescription — {typed.customer_name}</h1>
          <PrescriptionStatusBadge status={typed.status} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/50">
              Customer
            </h2>
            <InfoRow label="Name" value={typed.customer_name} />
            <InfoRow label="Phone" value={typed.phone} />
            <InfoRow label="Submitted" value={formatDateTime(typed.created_at)} />
            <InfoRow
              label="Fulfilment"
              value={
                typed.fulfilment_method ? (
                  <span className="capitalize">{typed.fulfilment_method}</span>
                ) : null
              }
            />
            {typed.fulfilment_method === "delivery" && (
              <InfoRow label="Delivery address" value={typed.delivery_address} />
            )}
            <InfoRow label="Customer notes" value={typed.notes} />
            {linkedOrder && (
              <InfoRow
                label="Linked order"
                value={
                  <Link
                    href={`/admin/orders/${linkedOrder.id}`}
                    className="font-medium text-brand hover:text-brand-dark"
                  >
                    {linkedOrder.order_number}
                  </Link>
                }
              />
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
              Prescription file
            </h2>
            <ViewFileButton prescriptionId={id} />
          </section>
        </div>

        <div className="space-y-4">
          <PrescriptionStatusForm prescriptionId={id} currentStatus={typed.status} />
          <PrescriptionNotesForm prescriptionId={id} notes={typed.admin_notes} />
          <LinkOrderForm
            prescriptionId={id}
            linkedOrderNumber={linkedOrder?.order_number ?? null}
          />
        </div>
      </div>
    </div>
  );
}
