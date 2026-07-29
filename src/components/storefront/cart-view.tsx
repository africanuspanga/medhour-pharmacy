"use client";

import Link from "next/link";
import { useCartStore, useCartTotals } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { formatTzs } from "@/lib/utils";
import { ProductImage } from "@/components/product/product-image";
import { EmptyState } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CartView() {
  const { items, subtotal, hasPrescriptionItems } = useCartTotals();
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const mounted = useMounted();

  if (!mounted) {
    return <div className="mt-6 h-48 animate-pulse rounded-2xl bg-surface" aria-label="Loading cart" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          title="Your cart is empty"
          description="Browse our products and add what you need to your cart."
          action={
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Start shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-4" aria-label="Cart items">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex gap-4 rounded-2xl border border-ink/8 bg-white p-4 shadow-sm"
          >
            <Link
              href={`/products/${item.slug}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-ink/8"
            >
              <ProductImage src={item.imageUrl} alt={item.name} className="absolute inset-0" sizes="80px" />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand"
                  >
                    {item.name}
                  </Link>
                  {item.packSize && <p className="mt-0.5 text-xs text-ink/50">{item.packSize}</p>}
                  {item.requiresPrescription && (
                    <Badge tone="blue" className="mt-1.5">
                      Rx
                    </Badge>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="shrink-0 rounded-full p-2.5 text-ink/40 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                <div
                  className="inline-flex items-center rounded-full border border-ink/15"
                  role="group"
                  aria-label={`Quantity for ${item.name}`}
                >
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    aria-label="Decrease quantity"
                    className="flex h-9 w-9 items-center justify-center rounded-full font-semibold text-ink hover:bg-surface"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold" aria-live="polite">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.maxQuantity > 0 && item.quantity >= item.maxQuantity}
                    aria-label="Increase quantity"
                    className="flex h-9 w-9 items-center justify-center rounded-full font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink/50">{formatTzs(item.unitPrice)} each</p>
                  <p className="text-sm font-bold text-brand-dark">{formatTzs(item.unitPrice * item.quantity)}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-2xl border border-ink/8 bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <h2 className="text-base font-bold text-ink">Order Summary</h2>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-ink/60">Subtotal</span>
          <span className="text-lg font-bold text-brand-dark">{formatTzs(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Delivery details and any delivery fee are collected at checkout.
        </p>
        {hasPrescriptionItems && (
          <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Your cart contains prescription products — you will be asked to upload a valid prescription at
            checkout.
          </p>
        )}
        <Link href="/checkout" className="mt-5 block">
          <Button size="lg" className="w-full">
            Proceed to checkout
          </Button>
        </Link>
        <Link
          href="/shop"
          className="mt-3 block text-center text-sm font-semibold text-brand hover:text-brand-dark"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
