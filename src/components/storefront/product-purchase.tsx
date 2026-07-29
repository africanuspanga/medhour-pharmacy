"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

/** Quantity selector wired to the shared AddToCartButton. */
export function ProductPurchase({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock_quantity <= 0;

  const change = (delta: number) => {
    setQuantity((q) => {
      const next = q + delta;
      if (next < 1) return 1;
      if (product.stock_quantity > 0) return Math.min(next, product.stock_quantity);
      return next;
    });
  };

  return (
    <div className="flex flex-wrap items-stretch gap-3">
      <div
        className="inline-flex items-center rounded-full border border-ink/15"
        role="group"
        aria-label="Quantity"
      >
        <button
          type="button"
          onClick={() => change(-1)}
          disabled={quantity <= 1 || outOfStock}
          aria-label="Decrease quantity"
          className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-semibold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-10 text-center text-sm font-semibold text-ink" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => change(1)}
          disabled={outOfStock || (product.stock_quantity > 0 && quantity >= product.stock_quantity)}
          aria-label="Increase quantity"
          className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-semibold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
      <AddToCartButton product={product} quantity={quantity} size="lg" className="flex-1 sm:flex-none sm:px-10" />
    </div>
  );
}
