"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export interface ProductFormState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  productId?: string;
  created?: boolean;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function nullable(value: string): string | null {
  return value === "" ? null : value;
}

export async function upsertProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const id = str(formData, "id");
    const name = str(formData, "name");
    const slugRaw = str(formData, "slug");
    const slug = slugRaw ? slugify(slugRaw) : slugify(name);

    const errors: Record<string, string> = {};
    if (!name) errors.name = "Name is required";
    if (!slug) errors.slug = "Slug is required";

    const price = Number(str(formData, "price"));
    if (!Number.isFinite(price) || price < 0) errors.price = "Enter a valid price";

    const salePriceRaw = str(formData, "sale_price");
    let salePrice: number | null = null;
    if (salePriceRaw !== "") {
      salePrice = Number(salePriceRaw);
      if (!Number.isFinite(salePrice) || salePrice < 0) {
        errors.sale_price = "Enter a valid sale price";
      }
    }

    const stockQuantity = parseInt(str(formData, "stock_quantity") || "0", 10);
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      errors.stock_quantity = "Enter a valid stock quantity";
    }

    const lowStockThreshold = parseInt(str(formData, "low_stock_threshold") || "5", 10);
    if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
      errors.low_stock_threshold = "Enter a valid threshold";
    }

    if (Object.keys(errors).length > 0) {
      return { ok: false, message: "Please fix the errors below.", errors };
    }

    // Brand: existing id or a free-text new brand name.
    let brandId: string | null = nullable(str(formData, "brand_id"));
    const newBrand = str(formData, "new_brand");
    if (!brandId && newBrand) {
      const { data: existing } = await supabase
        .from("brands")
        .select("id")
        .ilike("name", newBrand)
        .maybeSingle();
      if (existing) {
        brandId = existing.id;
      } else {
        const { data: created, error: brandError } = await supabase
          .from("brands")
          .insert({ name: newBrand, slug: slugify(newBrand) })
          .select("id")
          .single();
        if (brandError) {
          return { ok: false, message: `Could not create brand: ${brandError.message}` };
        }
        brandId = created.id;
      }
    }

    const keywords = str(formData, "keywords")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      name,
      slug,
      generic_name: nullable(str(formData, "generic_name")),
      brand_id: brandId,
      category_id: nullable(str(formData, "category_id")),
      sku: nullable(str(formData, "sku")),
      short_description: nullable(str(formData, "short_description")),
      description: nullable(str(formData, "description")),
      usage_info: nullable(str(formData, "usage_info")),
      warnings: nullable(str(formData, "warnings")),
      keywords: keywords.length > 0 ? keywords : null,
      pack_size: nullable(str(formData, "pack_size")),
      price,
      sale_price: salePrice,
      stock_quantity: stockQuantity,
      low_stock_threshold: lowStockThreshold,
      requires_prescription: formData.get("requires_prescription") === "on",
      is_featured: formData.get("is_featured") === "on",
      is_active: formData.get("is_active") === "on",
      updated_at: new Date().toISOString(),
    };

    let productId = id;
    if (id) {
      const { error } = await supabase.from("products").update(payload).eq("id", id);
      if (error) {
        if (error.code === "23505") {
          return { ok: false, errors: { slug: "Slug or SKU already in use" }, message: "Duplicate slug or SKU." };
        }
        return { ok: false, message: error.message };
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select("id")
        .single();
      if (error) {
        if (error.code === "23505") {
          return { ok: false, errors: { slug: "Slug or SKU already in use" }, message: "Duplicate slug or SKU." };
        }
        return { ok: false, message: error.message };
      }
      productId = data.id;
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    return {
      ok: true,
      message: id ? "Product updated." : "Product created.",
      productId,
      created: !id,
    };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}

export interface ImageActionState {
  ok: boolean;
  message?: string;
}

const BUCKET = "product-images";

export async function uploadProductImage(
  _prev: ImageActionState,
  formData: FormData
): Promise<ImageActionState> {
  try {
    await requireAdmin();
    const productId = str(formData, "product_id");
    const file = formData.get("file");
    if (!productId) return { ok: false, message: "Missing product." };
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, message: "Choose an image file first." };
    }
    if (!file.type.startsWith("image/")) {
      return { ok: false, message: "File must be an image." };
    }

    const supabase = createAdminClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `${productId}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type });
    if (uploadError) return { ok: false, message: uploadError.message };

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { count } = await supabase
      .from("product_images")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);

    const { error: insertError } = await supabase.from("product_images").insert({
      product_id: productId,
      image_url: urlData.publicUrl,
      alt_text: file.name,
      sort_order: count ?? 0,
    });
    if (insertError) return { ok: false, message: insertError.message };

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/products");
    return { ok: true, message: "Image uploaded." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}

/** Bound form action: deletes a product image row and its storage object. */
export async function deleteProductImage(imageId: string, productId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: image } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("id", imageId)
    .single();

  await supabase.from("product_images").delete().eq("id", imageId);

  if (image?.image_url) {
    const marker = `/object/public/${BUCKET}/`;
    const idx = image.image_url.indexOf(marker);
    if (idx >= 0) {
      const path = decodeURIComponent(image.image_url.slice(idx + marker.length));
      await supabase.storage.from(BUCKET).remove([path]);
    }
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
}

/** Bound form action: soft-deletes a product (keeps order history intact). */
export async function archiveProduct(productId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("products")
    .update({ archived_at: new Date().toISOString(), is_active: false, updated_at: new Date().toISOString() })
    .eq("id", productId);
  revalidatePath("/admin/products");
}

/** Bound form action: restores an archived product. */
export async function unarchiveProduct(productId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("products")
    .update({ archived_at: null, is_active: true, updated_at: new Date().toISOString() })
    .eq("id", productId);
  revalidatePath("/admin/products");
}

/** Bound form action: toggles storefront visibility. */
export async function setProductActive(productId: string, active: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("products")
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq("id", productId);
  revalidatePath("/admin/products");
}
