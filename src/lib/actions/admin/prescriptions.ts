"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PrescriptionStatus } from "@/lib/types";

export interface PrescriptionActionState {
  ok: boolean;
  message?: string;
  url?: string;
}

const STATUSES: PrescriptionStatus[] = [
  "pending",
  "approved",
  "rejected",
  "clarification_requested",
];

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function setPrescriptionStatus(
  _prev: PrescriptionActionState,
  formData: FormData
): Promise<PrescriptionActionState> {
  try {
    await requireAdmin();
    const id = str(formData, "prescription_id");
    const status = str(formData, "status") as PrescriptionStatus;
    if (!id) return { ok: false, message: "Missing prescription." };
    if (!STATUSES.includes(status)) return { ok: false, message: "Invalid status." };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("prescriptions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { ok: false, message: error.message };

    revalidatePath("/admin/prescriptions");
    revalidatePath(`/admin/prescriptions/${id}`);
    return { ok: true, message: `Status updated to ${status}.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}

export async function updatePrescriptionNotes(
  _prev: PrescriptionActionState,
  formData: FormData
): Promise<PrescriptionActionState> {
  try {
    await requireAdmin();
    const id = str(formData, "prescription_id");
    const notes = str(formData, "admin_notes");
    if (!id) return { ok: false, message: "Missing prescription." };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("prescriptions")
      .update({ admin_notes: notes || null, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { ok: false, message: error.message };

    revalidatePath(`/admin/prescriptions/${id}`);
    return { ok: true, message: "Notes saved." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}

/** Links an order by its order number (e.g. MED-2026-00042); empty value unlinks. */
export async function linkPrescriptionOrder(
  _prev: PrescriptionActionState,
  formData: FormData
): Promise<PrescriptionActionState> {
  try {
    await requireAdmin();
    const id = str(formData, "prescription_id");
    const orderNumber = str(formData, "order_number");
    if (!id) return { ok: false, message: "Missing prescription." };

    const supabase = createAdminClient();

    let orderId: string | null = null;
    if (orderNumber) {
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (!order) {
        return { ok: false, message: `No order found with number "${orderNumber}".` };
      }
      orderId = order.id;
    }

    const { error } = await supabase
      .from("prescriptions")
      .update({ order_id: orderId, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { ok: false, message: error.message };

    revalidatePath(`/admin/prescriptions/${id}`);
    return { ok: true, message: orderId ? "Order linked." : "Order unlinked." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}

/**
 * Returns a short-lived signed URL for the prescription file.
 * The prescriptions bucket is PRIVATE — never expose public URLs.
 */
export async function getPrescriptionFileUrl(
  prescriptionId: string
): Promise<PrescriptionActionState> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: prescription, error } = await supabase
      .from("prescriptions")
      .select("file_path")
      .eq("id", prescriptionId)
      .single();
    if (error || !prescription) return { ok: false, message: "Prescription not found." };

    const { data, error: signError } = await supabase.storage
      .from("prescriptions")
      .createSignedUrl(prescription.file_path, 300);
    if (signError || !data?.signedUrl) {
      return { ok: false, message: signError?.message ?? "Could not create signed URL." };
    }

    return { ok: true, url: data.signedUrl };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}
