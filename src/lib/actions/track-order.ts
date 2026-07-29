"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

export interface TrackedOrder {
  order_number: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  delivery_method: "delivery" | "pickup";
  total_amount: number;
  created_at: string;
  items: { product_name: string; pack_size: string | null; quantity: number; line_total: number }[];
  history: { status: string; note: string | null; created_at: string }[];
}

export interface TrackOrderResult {
  ok: boolean;
  order?: TrackedOrder;
  message?: string;
}

const digitsOnly = (s: string) => s.replace(/\D/g, "");

/**
 * Guest order tracking. Only returns the order when BOTH the order number and
 * the phone number on the order match, and only exposes customer-safe fields.
 */
export async function trackOrder(orderNumber: string, phone: string): Promise<TrackOrderResult> {
  const number = orderNumber.trim();
  const phoneDigits = digitsOnly(phone);
  if (!number || !phoneDigits) {
    return { ok: false, message: "Enter your order number and phone number." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(
      "order_number, phone, order_status, payment_status, delivery_method, total_amount, created_at, items:order_items(product_name, pack_size, quantity, line_total), history:order_status_history(status, note, created_at)"
    )
    .eq("order_number", number)
    .maybeSingle();

  if (error) return { ok: false, message: "Could not look up your order. Please try again." };

  // Match on phone digits (last 9 digits covers +255 / 0 prefixes).
  const orderPhone = digitsOnly(String(data?.phone ?? ""));
  const matches =
    !!data && !!orderPhone && (orderPhone === phoneDigits || orderPhone.endsWith(phoneDigits.slice(-9)));

  if (!matches) {
    return {
      ok: false,
      message:
        "We could not find an order with that order number and phone number. Check both and try again.",
    };
  }

  const history = ((data.history ?? []) as TrackedOrder["history"]).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return {
    ok: true,
    order: {
      order_number: data.order_number as string,
      order_status: data.order_status as OrderStatus,
      payment_status: data.payment_status as PaymentStatus,
      delivery_method: data.delivery_method as "delivery" | "pickup",
      total_amount: Number(data.total_amount),
      created_at: data.created_at as string,
      items: (data.items ?? []) as TrackedOrder["items"],
      history,
    },
  };
}
