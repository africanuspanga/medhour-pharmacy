"use client";

import { useActionState, useEffect, useRef } from "react";
import { adjustStock, type InventoryActionState } from "@/lib/actions/admin/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

const initialState: InventoryActionState = { ok: false };

export function StockAdjustForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(adjustStock, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form action={formAction} ref={formRef} className="space-y-1">
      <input type="hidden" name="product_id" value={productId} />
      <div className="flex flex-wrap items-center gap-2">
        <Input
          name="delta"
          type="number"
          step="1"
          required
          placeholder="+10 or -3"
          className="w-24"
          aria-label="Stock adjustment"
        />
        <Input
          name="reason"
          placeholder="Reason (optional)"
          className="min-w-32 flex-1"
          aria-label="Reason"
        />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Saving…" : "Adjust"}
        </Button>
      </div>
      {state.message && (
        <p className={`text-xs ${state.ok ? "text-brand-dark" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
