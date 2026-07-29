"use client";

import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export interface ReorderItem {
  product: Product;
  quantity: number;
}

export function ReorderButton({ items }: { items: ReorderItem[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const toast = useToast();

  if (items.length === 0) return null;

  return (
    <Button
      variant="outline"
      onClick={() => {
        for (const item of items) {
          if (item.product.stock_quantity > 0) {
            addItem(item.product, item.quantity);
          }
        }
        toast("Order items added to your cart");
      }}
    >
      Reorder
    </Button>
  );
}
