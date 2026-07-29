"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DeliveryMethod, PaymentMethod, Product } from "@/lib/types";
import { effectivePrice } from "@/lib/utils";

export interface PlaceOrderResult {
  ok: boolean;
  orderNumber?: string;
  errors?: Record<string, string>;
  message?: string;
}

interface CartPayloadItem {
  productId: string;
  quantity: number;
}

const MAX_PRESCRIPTION_BYTES = 5 * 1024 * 1024;
const PRESCRIPTION_TYPES = ["image/jpeg", "image/png", "application/pdf"];

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
  return cleaned.slice(-80) || "prescription";
}

/**
 * Guest-safe checkout. Prices and stock are always re-read from the database —
 * the client only sends product IDs and quantities.
 */
export async function placeOrder(formData: FormData): Promise<PlaceOrderResult> {
  const errors: Record<string, string> = {};

  const str = (key: string) => String(formData.get(key) ?? "").trim();

  const customerName = str("customer_name");
  const phone = str("phone");
  const email = str("email");
  const deliveryMethod = str("delivery_method") as DeliveryMethod;
  const region = str("region");
  const district = str("district");
  const deliveryAddress = str("delivery_address");
  const landmark = str("landmark");
  const customerNotes = str("customer_notes");
  const paymentMethod = str("payment_method") as PaymentMethod;

  // ---- Field validation (never throw on bad input) ----
  if (!customerName) errors.customer_name = "Full name is required.";
  if (!phone) errors.phone = "Phone number is required.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (deliveryMethod !== "delivery" && deliveryMethod !== "pickup") {
    errors.delivery_method = "Choose delivery or pickup.";
  }
  if (deliveryMethod === "delivery") {
    if (!region) errors.region = "Region is required for delivery.";
    if (!district) errors.district = "District is required for delivery.";
    if (!deliveryAddress) errors.delivery_address = "Delivery address is required.";
  }
  if (!["cash_on_delivery", "pay_on_pickup", "mobile_money"].includes(paymentMethod)) {
    errors.payment_method = "Choose a payment method.";
  }

  // ---- Cart payload ----
  let cartItems: CartPayloadItem[] = [];
  try {
    const parsed = JSON.parse(str("cart"));
    if (Array.isArray(parsed)) {
      cartItems = parsed
        .filter((i) => i && typeof i.productId === "string" && Number.isFinite(Number(i.quantity)))
        .map((i) => ({ productId: i.productId, quantity: Math.max(1, Math.floor(Number(i.quantity))) }));
    }
  } catch {
    // handled below
  }
  if (cartItems.length === 0) {
    return { ok: false, message: "Your cart is empty. Add products before checking out." };
  }

  // ---- Prescription file (optional; client enforces it for Rx carts) ----
  const prescriptionFile = formData.get("prescription");
  const hasFile = prescriptionFile instanceof File && prescriptionFile.size > 0;
  if (hasFile) {
    if (!PRESCRIPTION_TYPES.includes(prescriptionFile.type)) {
      errors.prescription = "Prescription must be a JPG, PNG or PDF file.";
    } else if (prescriptionFile.size > MAX_PRESCRIPTION_BYTES) {
      errors.prescription = "Prescription file must be smaller than 5 MB.";
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // ---- Current session (optional — guests allowed) ----
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const customerId = user?.id ?? null;

  const admin = createAdminClient();

  // ---- Re-read products server-side; validate stock ----
  const ids = [...new Set(cartItems.map((i) => i.productId))];
  const { data: productsData, error: productsError } = await admin
    .from("products")
    .select("*")
    .in("id", ids)
    .eq("is_active", true);
  if (productsError) {
    return { ok: false, message: "Could not verify your cart. Please try again." };
  }
  const products = new Map((productsData ?? []).map((p) => [p.id as string, p as unknown as Product]));

  const insufficient: string[] = [];
  const lines: {
    product: Product;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[] = [];

  for (const item of cartItems) {
    const product = products.get(item.productId);
    if (!product) {
      insufficient.push("an unavailable product");
      continue;
    }
    if (product.stock_quantity < item.quantity) {
      insufficient.push(
        `${product.name} (only ${Math.max(product.stock_quantity, 0)} in stock)`
      );
      continue;
    }
    const unitPrice = effectivePrice(product);
    lines.push({ product, quantity: item.quantity, unitPrice, lineTotal: unitPrice * item.quantity });
  }

  if (insufficient.length > 0) {
    return {
      ok: false,
      message: `Insufficient stock for: ${insufficient.join(", ")}. Please adjust your cart.`,
    };
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const deliveryFee = 0;
  const totalAmount = subtotal + deliveryFee;

  // ---- Prescription upload (private bucket) ----
  let prescriptionId: string | null = null;
  if (hasFile) {
    const path = `guest/${crypto.randomUUID()}/${sanitizeFilename(prescriptionFile.name)}`;
    const { error: uploadError } = await admin.storage
      .from("prescriptions")
      .upload(path, prescriptionFile, { contentType: prescriptionFile.type });
    if (uploadError) {
      return { ok: false, errors: { prescription: "Could not upload the prescription. Please try again." } };
    }
    const { data: rxRow, error: rxError } = await admin
      .from("prescriptions")
      .insert({
        customer_id: customerId,
        customer_name: customerName,
        phone,
        file_path: path,
        fulfilment_method: deliveryMethod,
        delivery_address: deliveryMethod === "delivery" ? deliveryAddress : null,
        status: "pending",
      })
      .select("id")
      .single();
    if (rxError) {
      return { ok: false, message: "Could not save your prescription. Please try again." };
    }
    prescriptionId = rxRow.id as string;
  }

  // ---- Insert order ----
  const { data: orderRow, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_id: customerId,
      customer_name: customerName,
      phone,
      email: email || null,
      delivery_method: deliveryMethod,
      region: deliveryMethod === "delivery" ? region : null,
      district: deliveryMethod === "delivery" ? district : null,
      delivery_address: deliveryMethod === "delivery" ? deliveryAddress : null,
      landmark: deliveryMethod === "delivery" ? landmark || null : null,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_status: paymentMethod === "cash_on_delivery" ? "cash_on_delivery" : "pending",
      order_status: "pending",
      customer_notes: customerNotes || null,
      prescription_id: prescriptionId,
    })
    .select("id, order_number")
    .single();

  if (orderError || !orderRow) {
    return { ok: false, message: "Could not place your order. Please try again." };
  }
  const orderId = orderRow.id as string;
  const orderNumber = orderRow.order_number as string;

  // ---- Order item snapshots ----
  const { error: itemsError } = await admin.from("order_items").insert(
    lines.map((l) => ({
      order_id: orderId,
      product_id: l.product.id,
      product_name: l.product.name,
      pack_size: l.product.pack_size,
      unit_price: l.unitPrice,
      quantity: l.quantity,
      line_total: l.lineTotal,
      requires_prescription: l.product.requires_prescription,
    }))
  );
  if (itemsError) {
    return { ok: false, message: "Could not place your order. Please try again." };
  }

  // ---- Link prescription to order ----
  if (prescriptionId) {
    await admin.from("prescriptions").update({ order_id: orderId }).eq("id", prescriptionId);
  }

  // ---- Decrement stock (never below 0 — validated above) + movement log ----
  for (const l of lines) {
    const newQty = Math.max(l.product.stock_quantity - l.quantity, 0);
    await admin.from("products").update({ stock_quantity: newQty }).eq("id", l.product.id);
    await admin.from("inventory_movements").insert({
      product_id: l.product.id,
      change: -l.quantity,
      movement_type: "order_placed",
      reason: `Order ${orderNumber}`,
      order_id: orderId,
    });
  }

  // ---- Initial status history entry ----
  await admin.from("order_status_history").insert({
    order_id: orderId,
    status: "pending",
    note: "Order placed",
    changed_by: null,
  });

  return { ok: true, orderNumber };
}
