import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/feedback";
import { PRESCRIPTION_STATUS_LABELS, PrescriptionStatusBadge } from "../status-badges";

export const metadata: Metadata = { title: "Prescriptions — Admin" };

export const dynamic = "force-dynamic";

export default async function AdminPrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("prescriptions")
    .select("id, customer_name, phone, status, fulfilment_method, order_id, created_at")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data: prescriptions } = await query;
  const rows = prescriptions ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">Prescriptions</h1>
        <form className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Select name="status" defaultValue={status ?? ""} className="w-full sm:w-auto">
            <option value="">All statuses</option>
            {Object.entries(PRESCRIPTION_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button type="submit" size="sm" variant="outline">
            Filter
          </Button>
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No prescriptions found"
          description="Uploaded prescriptions will appear here."
        />
      ) : (
        <>
          {/* Mobile: stacked prescription cards */}
          <div className="space-y-3 md:hidden">
            {rows.map((prescription) => (
              <div key={prescription.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/prescriptions/${prescription.id}`}
                    className="min-w-0 font-medium text-brand hover:text-brand-dark"
                  >
                    {prescription.customer_name}
                  </Link>
                  <PrescriptionStatusBadge status={prescription.status} />
                </div>
                <p className="mt-1 text-sm text-ink/60">{prescription.phone}</p>
                <p className="mt-1 text-xs text-ink/50">
                  {formatDateTime(prescription.created_at)} ·{" "}
                  <span className="capitalize">{prescription.fulfilment_method ?? "—"}</span>
                </p>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Fulfilment</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((prescription) => (
                <tr key={prescription.id} className="border-b border-ink/5 last:border-0 hover:bg-surface/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/prescriptions/${prescription.id}`}
                      className="font-medium text-brand hover:text-brand-dark"
                    >
                      {prescription.customer_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{prescription.phone}</td>
                  <td className="px-4 py-3 text-ink/60">{formatDateTime(prescription.created_at)}</td>
                  <td className="px-4 py-3 text-ink/60 capitalize">
                    {prescription.fulfilment_method ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <PrescriptionStatusBadge status={prescription.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}
