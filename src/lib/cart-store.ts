"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LocalCartItem, Product } from "@/lib/types";
import { effectivePrice } from "@/lib/utils";

interface CartState {
  items: LocalCartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = [...get().items];
        const existing = items.find((i) => i.productId === product.id);
        const primaryImage = product.images?.[0]?.image_url ?? null;
        const maxQuantity = Math.max(product.stock_quantity, 0);

        if (existing) {
          existing.quantity = Math.min(existing.quantity + quantity, maxQuantity || existing.quantity + quantity);
        } else {
          items.push({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            packSize: product.pack_size,
            unitPrice: effectivePrice(product),
            imageUrl: primaryImage,
            requiresPrescription: product.requires_prescription,
            maxQuantity,
            quantity: Math.min(quantity, maxQuantity || quantity),
          });
        }
        set({ items });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.maxQuantity > 0 ? Math.min(quantity, i.maxQuantity) : quantity }
              : i
          ),
        });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "medhour-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function useCartTotals() {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const hasPrescriptionItems = items.some((i) => i.requiresPrescription);
  return { items, subtotal, count, hasPrescriptionItems };
}
