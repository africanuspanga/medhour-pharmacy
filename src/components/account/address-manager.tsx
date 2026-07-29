"use client";

import { useState, type FormEvent } from "react";
import { deleteAddress, saveAddress, type AddressInput } from "@/lib/actions/account";
import type { Address } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { EmptyState, Spinner } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast";

const EMPTY_FORM: AddressInput = {
  label: "",
  full_name: "",
  phone: "",
  region: "",
  district: "",
  address_line: "",
  landmark: "",
  is_default: false,
};

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const toast = useToast();
  const [editing, setEditing] = useState<AddressInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startEdit(address?: Address) {
    setError(null);
    setEditing(
      address
        ? {
            id: address.id,
            label: address.label ?? "",
            full_name: address.full_name,
            phone: address.phone,
            region: address.region,
            district: address.district,
            address_line: address.address_line,
            landmark: address.landmark ?? "",
            is_default: address.is_default,
          }
        : { ...EMPTY_FORM }
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    setSaving(true);
    const result = await saveAddress(editing);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }
    toast(editing.id ? "Address updated" : "Address added");
    setEditing(null);
  }

  async function handleDelete(address: Address) {
    if (!window.confirm(`Delete "${address.label || address.address_line}"?`)) return;
    setDeletingId(address.id);
    const result = await deleteAddress(address.id);
    setDeletingId(null);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast("Address deleted");
  }

  const set = (patch: Partial<AddressInput>) => setEditing((prev) => (prev ? { ...prev, ...patch } : prev));

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-ink/10 bg-white p-5 sm:p-6"
        noValidate
      >
        <h2 className="font-semibold text-ink">{editing.id ? "Edit address" : "Add a new address"}</h2>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label (e.g. Home, Office)">
            <Input value={editing.label ?? ""} onChange={(e) => set({ label: e.target.value })} />
          </Field>
          <Field label="Recipient full name" required>
            <Input value={editing.full_name} onChange={(e) => set({ full_name: e.target.value })} required />
          </Field>
          <Field label="Phone number" required>
            <Input
              type="tel"
              value={editing.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="+255 …"
              required
            />
          </Field>
          <Field label="Region" required>
            <Input
              value={editing.region}
              onChange={(e) => set({ region: e.target.value })}
              placeholder="Dar es Salaam"
              required
            />
          </Field>
          <Field label="District" required>
            <Input
              value={editing.district}
              onChange={(e) => set({ district: e.target.value })}
              placeholder="Ilala"
              required
            />
          </Field>
          <Field label="Landmark (optional)">
            <Input value={editing.landmark ?? ""} onChange={(e) => set({ landmark: e.target.value })} />
          </Field>
        </div>
        <Field label="Street address" required>
          <Textarea
            value={editing.address_line}
            onChange={(e) => set({ address_line: e.target.value })}
            placeholder="Building, street, area"
            required
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={editing.is_default ?? false}
            onChange={(e) => set({ is_default: e.target.checked })}
            className="h-4 w-4 rounded border-ink/20 accent-brand"
          />
          Set as my default address
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner className="h-4 w-4 text-white" /> : null}
            {saving ? "Saving…" : "Save Address"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => startEdit()}>Add Address</Button>
      </div>
      {addresses.length === 0 ? (
        <EmptyState
          title="No saved addresses"
          description="Save a delivery address to check out faster next time."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink">{address.label || "Address"}</p>
                {address.is_default && <Badge tone="green">Default</Badge>}
              </div>
              <p className="mt-2 text-sm text-ink">{address.full_name}</p>
              <p className="text-sm text-ink/60">{address.phone}</p>
              <p className="mt-1 text-sm text-ink/60">
                {[address.address_line, address.landmark, address.district, address.region]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(address)}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={deletingId === address.id}
                  onClick={() => handleDelete(address)}
                >
                  {deletingId === address.id ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
