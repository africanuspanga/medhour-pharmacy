import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Prescription } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/feedback";
import { PrescriptionStatusBadge } from "@/components/account/status-badges";

export const metadata: Metadata = {
  title: "My Prescriptions",
  description: "Track the prescriptions you've uploaded to Medhour Pharmacy.",
};

export default async function AccountPrescriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("customer_id", user!.id)
    .order("created_at", { ascending: false });
  const prescriptions = (data ?? []) as Prescription[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">My prescriptions</h2>
        <Link
          href="/prescriptions/upload"
          className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Upload Prescription
        </Link>
      </div>
      {prescriptions.length === 0 ? (
        <EmptyState
          title="No prescriptions yet"
          description="Upload a prescription and our pharmacist will review it and contact you."
        />
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">Uploaded {formatDate(rx.created_at)}</p>
                  <p className="text-xs text-ink/60">
                    {rx.fulfilment_method === "delivery" ? "Delivery" : "Pickup"}
                    {rx.order_id ? " · Linked to an order" : ""}
                  </p>
                </div>
                <PrescriptionStatusBadge status={rx.status} />
              </div>
              {rx.notes && <p className="mt-2 text-sm text-ink/70">Your notes: {rx.notes}</p>}
              {rx.admin_notes && (
                <p className="mt-2 rounded-lg bg-brand-light px-3 py-2 text-sm text-brand-dark">
                  Pharmacist: {rx.admin_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
