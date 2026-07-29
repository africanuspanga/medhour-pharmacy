import type { Metadata } from "next";
import { CartView } from "@/components/storefront/cart-view";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the items in your Medhour Pharmacy shopping cart.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Your Cart</h1>
      <CartView />
    </div>
  );
}
