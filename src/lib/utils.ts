import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Tanzanian Shillings, e.g. TZS 5,000 */
export function formatTzs(amount: number): string {
  return `TZS ${Math.round(amount).toLocaleString("en-US")}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Effective selling price (sale price when set and lower). */
export function effectivePrice(product: { price: number; sale_price: number | null }): number {
  if (product.sale_price != null && product.sale_price < product.price) {
    return product.sale_price;
  }
  return product.price;
}

export function stockStatus(quantity: number): { label: string; tone: "in" | "low" | "out" } {
  if (quantity <= 0) return { label: "Out of stock", tone: "out" };
  if (quantity <= 5) return { label: "Low stock", tone: "low" };
  return { label: "In stock", tone: "in" };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-TZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-TZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  cash_on_delivery: "Cash on Delivery",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: "Cash on Delivery",
  pay_on_pickup: "Payment on Pickup",
  mobile_money: "Mobile Money (pending confirmation)",
};
