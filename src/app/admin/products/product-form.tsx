"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { upsertProduct, type ProductFormState } from "@/lib/actions/admin/products";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import type { Brand, Category, Product } from "@/lib/types";

const initialState: ProductFormState = { ok: false };

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-ink/20 accent-brand"
      />
      {label}
    </label>
  );
}

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: Product;
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(upsertProduct, initialState);
  const [brandChoice, setBrandChoice] = useState<string>(product?.brand_id ?? "");

  useEffect(() => {
    if (state.created && state.productId) {
      router.push(`/admin/products/${state.productId}`);
    }
  }, [state, router]);

  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      {state.message && (
        <p
          className={`rounded-lg px-4 py-2 text-sm ${
            state.ok ? "bg-brand-light text-brand-dark" : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Basics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" required error={errors.name}>
            <Input name="name" defaultValue={product?.name ?? ""} required />
          </Field>
          <Field label="Slug" error={errors.slug}>
            <Input
              name="slug"
              defaultValue={product?.slug ?? ""}
              placeholder="Auto-generated from name if empty"
            />
          </Field>
          <Field label="Generic name">
            <Input name="generic_name" defaultValue={product?.generic_name ?? ""} />
          </Field>
          <Field label="SKU" error={errors.sku}>
            <Input name="sku" defaultValue={product?.sku ?? ""} />
          </Field>
          <Field label="Brand">
            <Select
              name="brand_id"
              value={brandChoice}
              onChange={(e) => setBrandChoice(e.target.value)}
            >
              <option value="">— No brand —</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
              <option value="__new">+ Add new brand…</option>
            </Select>
          </Field>
          {brandChoice === "__new" && (
            <Field label="New brand name" required>
              <Input name="new_brand" placeholder="e.g. Pfizer" required />
            </Field>
          )}
          <Field label="Category">
            <Select name="category_id" defaultValue={product?.category_id ?? ""}>
              <option value="">— No category —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Pack size">
            <Input
              name="pack_size"
              defaultValue={product?.pack_size ?? ""}
              placeholder="e.g. 10 tablets"
            />
          </Field>
        </div>
        <Field label="Short description">
          <Input name="short_description" defaultValue={product?.short_description ?? ""} />
        </Field>
        <Field label="Description">
          <Textarea name="description" defaultValue={product?.description ?? ""} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Usage information">
            <Textarea name="usage_info" defaultValue={product?.usage_info ?? ""} />
          </Field>
          <Field label="Warnings">
            <Textarea name="warnings" defaultValue={product?.warnings ?? ""} />
          </Field>
        </div>
        <Field label="Keywords (comma-separated)">
          <Input
            name="keywords"
            defaultValue={product?.keywords?.join(", ") ?? ""}
            placeholder="e.g. headache, pain relief, paracetamol"
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Pricing &amp; stock
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Price (TZS)" required error={errors.price}>
            <Input
              name="price"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.price ?? ""}
              required
            />
          </Field>
          <Field label="Sale price (optional)" error={errors.sale_price}>
            <Input
              name="sale_price"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.sale_price ?? ""}
            />
          </Field>
          <Field label="Stock quantity" error={errors.stock_quantity}>
            <Input
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.stock_quantity ?? 0}
            />
          </Field>
          <Field label="Low stock threshold" error={errors.low_stock_threshold}>
            <Input
              name="low_stock_threshold"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.low_stock_threshold ?? 5}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Flags</h2>
        <div className="flex flex-wrap gap-3">
          <Checkbox
            name="requires_prescription"
            label="Requires prescription"
            defaultChecked={product?.requires_prescription ?? false}
          />
          <Checkbox
            name="is_featured"
            label="Featured"
            defaultChecked={product?.is_featured ?? false}
          />
          <Checkbox
            name="is_active"
            label="Active (visible in store)"
            defaultChecked={product?.is_active ?? true}
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
