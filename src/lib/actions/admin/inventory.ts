"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface InventoryActionState {
  ok: boolean;
  message?: string;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** Adjusts a product's stock by a signed delta; stock never drops below 0. */
export async function adjustStock(
  _prev: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  try {
    const admin = await requireAdmin();
    const productId = str(formData, "product_id");
    const delta = parseInt(str(formData, "delta"), 10);
    const reason = str(formData, "reason");

    if (!productId) return { ok: false, message: "Missing product." };
    if (!Number.isInteger(delta) || delta === 0) {
      return { ok: false, message: "Enter a non-zero adjustment (e.g. 10 or -3)." };
    }

    const supabase = createAdminClient();
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id, name, stock_quantity")
      .eq("id", productId)
      .single();
    if (fetchError || !product) return { ok: false, message: "Product not found." };

    const newQuantity = Math.max(0, product.stock_quantity + delta);
    const actualChange = newQuantity - product.stock_quantity;
    if (actualChange === 0) {
      return { ok: false, message: "Stock is already 0 — cannot reduce further." };
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock_quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq("id", productId);
    if (updateError) return { ok: false, message: updateError.message };

    const { error: movementError } = await supabase.from("inventory_movements").insert({
      product_id: productId,
      change: actualChange,
      movement_type: actualChange > 0 ? "restock" : "manual_adjustment",
      reason: reason || null,
      admin_id: admin.id,
    });
    if (movementError) return { ok: false, message: movementError.message };

    revalidatePath("/admin/inventory");
    return {
      ok: true,
      message: `${product.name}: ${product.stock_quantity} → ${newQuantity}`,
    };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}
