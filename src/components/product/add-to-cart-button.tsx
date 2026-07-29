"use client";

import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  size = "md",
}: {
  product: Product;
  quantity?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const addItem = useCartStore((s) => s.addItem);
  const toast = useToast();
  const outOfStock = product.stock_quantity <= 0;

  return (
    <Button
      size={size}
      className={className}
      disabled={outOfStock}
      onClick={() => {
        addItem(product, quantity);
        toast(`${product.name} added to cart`);
      }}
    >
      {outOfStock ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
}
