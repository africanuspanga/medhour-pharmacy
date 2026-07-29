import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/storefront/track-order-form";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Check the status of your Medhour Pharmacy order with your order number and phone number.",
};

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Track Your Order</h1>
      <p className="mt-1 text-sm text-ink/60">
        Enter your order number and the phone number you used at checkout.
      </p>
      <TrackOrderForm />
    </div>
  );
}
