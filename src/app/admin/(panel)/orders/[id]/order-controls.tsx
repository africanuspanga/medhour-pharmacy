"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addOrderNote,
  updateOrderStatus,
  updatePaymentStatus,
  type OrderActionState,
} from "@/lib/actions/admin/orders";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/utils";

const initialState: OrderActionState = { ok: false };

function StateMessage({ state }: { state: OrderActionState }) {
  if (!state.message) return null;
  return (
    <p className={`text-sm ${state.ok ? "text-brand-dark" : "text-red-600"}`}>{state.message}</p>
  );
}

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(updateOrderStatus, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Order status</h2>
      <input type="hidden" name="order_id" value={orderId} />
      <Field label="Status">
        <Select name="status" defaultValue={currentStatus}>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Note (optional, added to timeline)">
        <Input name="note" placeholder="e.g. Customer called to confirm" />
      </Field>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Updating…" : "Update status"}
      </Button>
      {currentStatus !== "cancelled" && (
        <p className="text-xs text-ink/50">
          Cancelling an order restores its items to stock automatically.
        </p>
      )}
      <StateMessage state={state} />
    </form>
  );
}

export function PaymentStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(updatePaymentStatus, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Payment status</h2>
      <input type="hidden" name="order_id" value={orderId} />
      <Field label="Status">
        <Select name="payment_status" defaultValue={currentStatus}>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Updating…" : "Update payment"}
      </Button>
      <StateMessage state={state} />
    </form>
  );
}

export function AddNoteForm({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(addOrderNote, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form action={formAction} ref={formRef} className="space-y-3">
      <input type="hidden" name="order_id" value={orderId} />
      <Field label="Add internal note">
        <Textarea name="note" rows={2} placeholder="Only visible to admins" required />
      </Field>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Adding…" : "Add note"}
      </Button>
      <StateMessage state={state} />
    </form>
  );
}

export function PrintButton() {
  return (
    <Button type="button" size="sm" variant="outline" onClick={() => window.print()}>
      Print
    </Button>
  );
}
