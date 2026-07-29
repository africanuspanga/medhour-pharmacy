"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductImage as ProductImageType } from "@/lib/types";
import { ProductImage } from "@/components/product/product-image";

/** Image gallery with a thumbnail switcher for products with multiple images. */
export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImageType[];
  productName: string;
}) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const [active, setActive] = useState(0);
  const current = sorted[Math.min(active, sorted.length - 1)];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-ink/8 bg-white">
        <ProductImage
          src={current?.image_url ?? null}
          alt={current?.alt_text ?? productName}
          className="absolute inset-0"
          sizes="(max-width: 1024px) 100vw, 40vw"
        />
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Product images">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`View image ${i + 1} of ${sorted.length}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                i === active ? "border-brand" : "border-ink/10 hover:border-ink/25"
              )}
            >
              <ProductImage src={img.image_url} alt={img.alt_text ?? productName} className="absolute inset-0" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
