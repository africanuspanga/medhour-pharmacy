"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, useCartTotals } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { formatTzs } from "@/lib/utils";
import { placeOrder } from "@/lib/actions/checkout";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

type Errors = Record<string, string>;

const inputClass = (error?: string) => cn(error && "border-red-400 focus:border-red-500 focus:ring-red-200");

export function CheckoutForm() {
  const router = useRouter();
  const toast = useToast();
  const { items, subtotal, hasPrescriptionItems } = useCartTotals();
  const clearCart = useCartStore((s) => s.clearCart);

  const mounted = useMounted();

  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash_on_delivery" | "pay_on_pickup" | "mobile_money"
  >("cash_on_delivery");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prescriptionName, setPrescriptionName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!mounted) {
    return <div className="h-96 animate-pulse rounded-2xl bg-surface" aria-label="Loading checkout" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add products to your cart before checking out."
        action={
          <Link href="/shop" className="text-sm font-semibold text-brand hover:text-brand-dark">
            Go to the shop
          </Link>
        }
      />
    );
  }

  const validateFile = (file: File | null): string | null => {
    if (!file) return hasPrescriptionItems ? "Please upload your prescription (JPG, PNG or PDF)." : null;
    if (!ACCEPTED_TYPES.includes(file.type)) return "Prescription must be a JPG, PNG or PDF file.";
    if (file.size > MAX_FILE_BYTES) return "Prescription file must be smaller than 5 MB.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Client-side validation
    const clientErrors: Errors = {};
    const get = (k: string) => String(formData.get(k) ?? "").trim();
    if (!get("customer_name")) clientErrors.customer_name = "Full name is required.";
    if (!get("phone")) clientErrors.phone = "Phone number is required.";
    const email = get("email");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) clientErrors.email = "Enter a valid email address.";
    if (deliveryMethod === "delivery") {
      if (!get("region")) clientErrors.region = "Region is required for delivery.";
      if (!get("district")) clientErrors.district = "District is required for delivery.";
      if (!get("delivery_address")) clientErrors.delivery_address = "Delivery address is required.";
    }
    const file = fileRef.current?.files?.[0] ?? null;
    const fileError = validateFile(file);
    if (fileError) clientErrors.prescription = fileError;

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      formRef.current?.querySelector("[aria-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    formData.set(
      "cart",
      JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity })))
    );
    if (!file) formData.delete("prescription");

    setSubmitting(true);
    try {
      const result = await placeOrder(formData);
      if (result.ok && result.orderNumber) {
        clearCart();
        toast("Order placed successfully");
        router.push(`/checkout/confirmation?order=${encodeURIComponent(result.orderNumber)}`);
        return;
      }
      if (result.errors) setErrors(result.errors);
      setFormError(result.message ?? "Could not place your order. Please try again.");
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {/* Contact */}
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-ink">Contact Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors.customer_name}>
              <Input
                name="customer_name"
                autoComplete="name"
                aria-invalid={!!errors.customer_name}
                className={inputClass(errors.customer_name)}
              />
            </Field>
            <Field label="Phone number" required error={errors.phone}>
              <Input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+255 …"
                aria-invalid={!!errors.phone}
                className={inputClass(errors.phone)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Email (optional)" error={errors.email}>
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className={inputClass(errors.email)}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-ink">Delivery or Pickup</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Delivery method">
            {(
              [
                { value: "delivery", title: "Home delivery", text: "We deliver within Dar es Salaam." },
                { value: "pickup", title: "Pickup in store", text: "Collect from Benjamin Tower, Azikiwe Street, Posta." },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                  deliveryMethod === opt.value
                    ? "border-brand bg-brand-light"
                    : "border-ink/15 hover:border-ink/30"
                )}
              >
                <input
                  type="radio"
                  name="delivery_method"
                  value={opt.value}
                  checked={deliveryMethod === opt.value}
                  onChange={() => setDeliveryMethod(opt.value)}
                  className="mt-1 h-4 w-4 accent-brand"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">{opt.title}</span>
                  <span className="mt-0.5 block text-xs text-ink/60">{opt.text}</span>
                </span>
              </label>
            ))}
          </div>

          {deliveryMethod === "delivery" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Region" required error={errors.region}>
                <Input
                  name="region"
                  defaultValue="Dar es Salaam"
                  autoComplete="address-level1"
                  aria-invalid={!!errors.region}
                  className={inputClass(errors.region)}
                />
              </Field>
              <Field label="District" required error={errors.district}>
                <Input
                  name="district"
                  placeholder="e.g. Ilala"
                  autoComplete="address-level2"
                  aria-invalid={!!errors.district}
                  className={inputClass(errors.district)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Delivery address" required error={errors.delivery_address}>
                  <Textarea
                    name="delivery_address"
                    rows={2}
                    placeholder="Street, building, house/office number"
                    autoComplete="street-address"
                    aria-invalid={!!errors.delivery_address}
                    className={inputClass(errors.delivery_address)}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Nearby landmark (optional)">
                  <Input name="landmark" placeholder="e.g. Near Posta bus stop" />
                </Field>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Field label="Order notes (optional)">
              <Textarea name="customer_notes" rows={2} placeholder="Anything we should know about your order?" />
            </Field>
          </div>
        </section>

        {/* Prescription */}
        {hasPrescriptionItems && (
          <section className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-ink">Prescription</h2>
            <p className="mt-1 text-sm text-ink/60">
              Your cart contains prescription-only products. Upload a valid prescription — a pharmacist
              must approve it before your order is fulfilled.
            </p>
            <div className="mt-4">
              <Field label="Prescription file (JPG, PNG or PDF, max 5 MB)" required error={errors.prescription}>
                <Input
                  ref={fileRef}
                  name="prescription"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  aria-invalid={!!errors.prescription}
                  className={cn("file:mr-3 file:rounded-full file:border-0 file:bg-brand-light file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand-dark", inputClass(errors.prescription))}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setPrescriptionName(f?.name ?? null);
                    setErrors((prev) => {
                      const next = { ...prev };
                      const err = validateFile(f);
                      if (err) next.prescription = err;
                      else delete next.prescription;
                      return next;
                    });
                  }}
                />
              </Field>
              {prescriptionName && !errors.prescription && (
                <p className="mt-1 text-xs text-brand-dark">Selected: {prescriptionName}</p>
              )}
            </div>
          </section>
        )}

        {/* Payment */}
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-ink">Payment Method</h2>
          <div className="mt-4 space-y-3" role="radiogroup" aria-label="Payment method">
            {(
              [
                { value: "cash_on_delivery", title: "Cash on Delivery", text: "Pay in cash when your order arrives." },
                { value: "pay_on_pickup", title: "Pay on Pickup", text: "Pay when you collect your order in store." },
                { value: "mobile_money", title: "Mobile Money", text: "Payment marked pending until confirmed." },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                  paymentMethod === opt.value
                    ? "border-brand bg-brand-light"
                    : "border-ink/15 hover:border-ink/30"
                )}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value)}
                  className="mt-1 h-4 w-4 accent-brand"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">{opt.title}</span>
                  <span className="mt-0.5 block text-xs text-ink/60">{opt.text}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.payment_method && <p className="mt-2 text-xs text-red-600">{errors.payment_method}</p>}
        </section>
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-2xl border border-ink/8 bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <h2 className="text-base font-bold text-ink">Your Order</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex items-start justify-between gap-3">
              <span className="min-w-0 text-ink/80">
                <span className="line-clamp-1 font-medium">{i.name}</span>
                <span className="text-xs text-ink/50">
                  × {i.quantity}
                  {i.packSize ? ` · ${i.packSize}` : ""}
                </span>
              </span>
              <span className="shrink-0 font-semibold text-ink">{formatTzs(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
          <span className="text-sm text-ink/60">Total</span>
          <span className="text-lg font-bold text-brand-dark">{formatTzs(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          {deliveryMethod === "delivery"
            ? "Any delivery fee will be confirmed by the pharmacy."
            : "Pay when you collect your order at the pharmacy."}
        </p>

        {formError && (
          <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting}>
          {submitting ? "Placing order…" : "Place Order"}
        </Button>
        <Link
          href="/cart"
          className="mt-3 block text-center text-sm font-semibold text-brand hover:text-brand-dark"
        >
          Back to cart
        </Link>
      </aside>
    </form>
  );
}
