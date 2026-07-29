import type { Metadata } from "next";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order at Medhour Pharmacy.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Checkout</h1>
      <p className="mt-1 text-sm text-ink/60">Enter your details to place your order.</p>
      <div className="mt-6">
        <CheckoutForm />
      </div>
    </div>
  );
}
