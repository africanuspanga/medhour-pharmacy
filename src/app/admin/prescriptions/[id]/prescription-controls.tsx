"use client";

import { useActionState, useState, useTransition } from "react";
import {
  getPrescriptionFileUrl,
  linkPrescriptionOrder,
  setPrescriptionStatus,
  updatePrescriptionNotes,
  type PrescriptionActionState,
} from "@/lib/actions/admin/prescriptions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PRESCRIPTION_STATUS_LABELS } from "../../status-badges";

const initialState: PrescriptionActionState = { ok: false };

function StateMessage({ state }: { state: PrescriptionActionState }) {
  if (!state.message) return null;
  return (
    <p className={`text-sm ${state.ok ? "text-brand-dark" : "text-red-600"}`}>{state.message}</p>
  );
}

/** Fetches a short-lived signed URL for the private prescription file and opens it. */
export function ViewFileButton({ prescriptionId }: { prescriptionId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await getPrescriptionFileUrl(prescriptionId);
            if (result.ok && result.url) {
              window.open(result.url, "_blank", "noopener");
            } else {
              setError(result.message ?? "Could not open file.");
            }
          });
        }}
      >
        {pending ? "Generating link…" : "View prescription file"}
      </Button>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-ink/50">Opens a secure link valid for 5 minutes.</p>
    </div>
  );
}

export function PrescriptionStatusForm({
  prescriptionId,
  currentStatus,
}: {
  prescriptionId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(setPrescriptionStatus, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Status</h2>
      <input type="hidden" name="prescription_id" value={prescriptionId} />
      <Field label="Status">
        <Select name="status" defaultValue={currentStatus}>
          {Object.entries(PRESCRIPTION_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Updating…" : "Update status"}
      </Button>
      <StateMessage state={state} />
    </form>
  );
}

export function PrescriptionNotesForm({
  prescriptionId,
  notes,
}: {
  prescriptionId: string;
  notes: string | null;
}) {
  const [state, formAction, pending] = useActionState(updatePrescriptionNotes, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Admin notes</h2>
      <input type="hidden" name="prescription_id" value={prescriptionId} />
      <Field label="Notes (internal)">
        <Textarea name="admin_notes" rows={3} defaultValue={notes ?? ""} />
      </Field>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save notes"}
      </Button>
      <StateMessage state={state} />
    </form>
  );
}

export function LinkOrderForm({
  prescriptionId,
  linkedOrderNumber,
}: {
  prescriptionId: string;
  linkedOrderNumber: string | null;
}) {
  const [state, formAction, pending] = useActionState(linkPrescriptionOrder, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Linked order</h2>
      <input type="hidden" name="prescription_id" value={prescriptionId} />
      {linkedOrderNumber && (
        <p className="text-sm text-ink/60">
          Currently linked to <span className="font-medium text-ink">{linkedOrderNumber}</span>.
        </p>
      )}
      <Field label="Order number (e.g. MED-2026-00042)">
        <Input name="order_number" placeholder="Leave empty and submit to unlink" />
      </Field>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Saving…" : linkedOrderNumber ? "Update link" : "Link order"}
      </Button>
      <StateMessage state={state} />
    </form>
  );
}
