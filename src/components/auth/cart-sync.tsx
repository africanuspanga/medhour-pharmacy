"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import type { LocalCartItem, Product } from "@/lib/types";

/**
 * Merge the local (guest) cart with the customer's server-side cart.
 * Best-effort: all errors are swallowed so sync never blocks the UI.
 * Merge rule: DB wins ties on quantity; items missing on either side are copied over.
 */
export async function syncCartToServer(): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get-or-create the user's cart row.
    let { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("customer_id", user.id)
      .maybeSingle();
    if (!cart) {
      const { data: created } = await supabase
        .from("carts")
        .insert({ customer_id: user.id })
        .select("id")
        .single();
      cart = created;
    }
    if (!cart) return;

    const localItems = useCartStore.getState().items;

    // Existing DB items — needed so local additions don't overwrite DB quantities.
    const { data: existing } = await supabase
      .from("cart_items")
      .select("product_id")
      .eq("cart_id", cart.id);
    const existingIds = new Set((existing ?? []).map((r) => r.product_id as string));

    // Push local-only items to the DB (DB wins ties → skip items already in DB).
    const toInsert = localItems
      .filter((i) => !existingIds.has(i.productId))
      .map((i) => ({ cart_id: cart!.id, product_id: i.productId, quantity: i.quantity }));
    if (toInsert.length > 0) {
      await supabase.from("cart_items").upsert(toInsert, { onConflict: "cart_id,product_id" });
    }

    // Read back the merged cart and reconcile the local store (DB wins ties).
    const { data: dbItems } = await supabase
      .from("cart_items")
      .select("product_id, quantity, product:products(*, images:product_images(*))")
      .eq("cart_id", cart.id);
    if (!dbItems) return;

    const store = useCartStore.getState();
    for (const row of dbItems) {
      const product = row.product as unknown as Product | null;
      const quantity = row.quantity as number;
      if (!product || product.is_active === false) continue;
      const local: LocalCartItem | undefined = store.items.find((i) => i.productId === row.product_id);
      if (local) {
        if (local.quantity !== quantity) store.updateQuantity(product.id, quantity);
      } else {
        store.addItem(product, quantity);
      }
    }
  } catch {
    // Sync is best-effort — ignore failures silently.
  }
}

/** Mount once (account layout, login page) to sync the cart when authenticated. */
export function CartSync() {
  useEffect(() => {
    void syncCartToServer();
  }, []);
  return null;
}
