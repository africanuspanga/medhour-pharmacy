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
        <form>
          <Select name="status" defaultValue={status ?? ""} className="w-auto">
            <option value="">All statuses</option>
            {Object.entries(PRESCRIPTION_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button type="submit" size="sm" variant="outline" className="ml-2">
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
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
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
      )}
    </div>
  );
}
