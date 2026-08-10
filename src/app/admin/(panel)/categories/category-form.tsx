"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  upsertCategory,
  uploadCategoryImage,
  type CategoryFormState,
  type ImageActionState,
} from "@/lib/actions/admin/categories";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ProductImage } from "@/components/product/product-image";
import type { Category } from "@/lib/types";

const initialState: CategoryFormState = { ok: false };
const initialImageState: ImageActionState = { ok: false };

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(upsertCategory, initialState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
        {category ? `Edit: ${category.name}` : "Add category"}
      </h2>
      {category && <input type="hidden" name="id" value={category.id} />}

      {state.message && (
        <p
          className={`rounded-lg px-4 py-2 text-sm ${
            state.ok ? "bg-brand-light text-brand-dark" : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" required error={errors.name}>
          <Input name="name" defaultValue={category?.name ?? ""} required />
        </Field>
        <Field label="Slug" error={errors.slug}>
          <Input
            name="slug"
            defaultValue={category?.slug ?? ""}
            placeholder="Auto-generated from name if empty"
          />
        </Field>
        <Field label="Sort order" error={errors.sort_order}>
          <Input
            name="sort_order"
            type="number"
            step="1"
            defaultValue={category?.sort_order ?? 0}
          />
        </Field>
        <label className="flex items-end gap-2 pb-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={category?.is_active ?? true}
            className="h-4 w-4 rounded border-ink/20 accent-brand"
          />
          Active (visible in store)
        </label>
      </div>
      <Field label="Description">
        <Textarea name="description" defaultValue={category?.description ?? ""} rows={3} />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : category ? "Save changes" : "Create category"}
        </Button>
        {category && (
          <Button type="button" variant="ghost" onClick={() => router.push("/admin/categories")}>
            Cancel edit
          </Button>
        )}
      </div>
    </form>
  );
}

export function CategoryImageUpload({ category }: { category: Category }) {
  const [state, formAction, pending] = useActionState(uploadCategoryImage, initialImageState);

  return (
    <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
        Category image
      </h2>
      <ProductImage
        src={category.image_url}
        alt={category.name}
        className="h-32 w-32 rounded-lg"
        sizes="128px"
      />
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="category_id" value={category.id} />
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="min-w-0 max-w-full text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-brand-light file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-dark"
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
    </div>
  );
}
