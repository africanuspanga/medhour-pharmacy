"use client";

import { useActionState, useRef } from "react";
import {
  deleteProductImage,
  uploadProductImage,
  type ImageActionState,
} from "@/lib/actions/admin/products";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/product-image";
import type { ProductImage as ProductImageType } from "@/lib/types";

const initialState: ImageActionState = { ok: false };

export function ImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImageType[];
}) {
  const [state, formAction, pending] = useActionState(uploadProductImage, initialState);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Images</h2>

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <li key={image.id} className="space-y-2">
              <ProductImage
                src={image.image_url}
                alt={image.alt_text ?? "Product image"}
                className="aspect-square w-full rounded-lg"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <form action={deleteProductImage.bind(null, image.id, productId)}>
                <Button type="submit" size="sm" variant="ghost" className="w-full text-red-600">
                  Delete
                </Button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink/60">No images yet.</p>
      )}

      <form
        action={async (formData) => {
          await formAction(formData);
          if (fileRef.current) fileRef.current.value = "";
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <input type="hidden" name="product_id" value={productId} />
        <input
          ref={fileRef}
          type="file"
          name="file"
          accept="image/*"
          required
          className="text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-brand-light file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-dark"
        />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Uploading…" : "Upload"}
        </Button>
      </form>
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-brand-dark" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </section>
  );
}
