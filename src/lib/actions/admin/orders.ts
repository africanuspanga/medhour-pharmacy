"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

export interface OrderActionState {
  ok: boolean;
  message?: string;
}

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "completed",
  "cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "cash_on_delivery",
];

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function updateOrderStatus(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  try {
    const admin = await requireAdmin();
    const orderId = str(formData, "order_id");
    const status = str(formData, "status") as OrderStatus;
    const note = str(formData, "note");

    if (!orderId) return { ok: false, message: "Missing order." };
    if (!ORDER_STATUSES.includes(status)) return { ok: false, message: "Invalid status." };

    const supabase = createAdminClient();
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, order_number, order_status")
      .eq("id", orderId)
      .single();
    if (fetchError || !order) return { ok: false, message: "Order not found." };

    if (order.order_status === status) {
      return { ok: true, message: "Status unchanged." };
    }

    // Cancelling restores stock for every line item that still references a product.
    if (status === "cancelled" && order.order_status !== "cancelled") {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId)
        .not("product_id", "is", null);

      for (const item of items ?? []) {
        const { data: product } = await supabase
          .from("products")
          .select("id, stock_quantity")
          .eq("id", item.product_id)
          .single();
        if (!product) continue;

        const { error: stockError } = await supabase
          .from("products")
          .update({
            stock_quantity: product.stock_quantity + item.quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);
        if (stockError) return { ok: false, message: stockError.message };

        await supabase.from("inventory_movements").insert({
          product_id: product.id,
          change: item.quantity,
          movement_type: "order_cancelled",
          reason: `Order ${order.order_number} cancelled — stock restored`,
          order_id: orderId,
          admin_id: admin.id,
        });
      }
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (updateError) return { ok: false, message: updateError.message };

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status,
      note: note || null,
      changed_by: admin.id,
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true, message: `Status updated to ${status}.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}

export async function updatePaymentStatus(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  try {
    await requireAdmin();
    const orderId = str(formData, "order_id");
    const status = str(formData, "payment_status") as PaymentStatus;

    if (!orderId) return { ok: false, message: "Missing order." };
    if (!PAYMENT_STATUSES.includes(status)) return { ok: false, message: "Invalid payment status." };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: status, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) return { ok: false, message: error.message };

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true, message: "Payment status updated." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}

export async function addOrderNote(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  try {
    const admin = await requireAdmin();
    const orderId = str(formData, "order_id");
    const note = str(formData, "note");

    if (!orderId) return { ok: false, message: "Missing order." };
    if (!note) return { ok: false, message: "Note cannot be empty." };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("admin_notes")
      .insert({ order_id: orderId, admin_id: admin.id, note });
    if (error) return { ok: false, message: error.message };

    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true, message: "Note added." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}
