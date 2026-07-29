"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export interface CategoryFormState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function upsertCategory(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const id = str(formData, "id");
    const name = str(formData, "name");
    const slugRaw = str(formData, "slug");
    const slug = slugRaw ? slugify(slugRaw) : slugify(name);
    const sortOrder = parseInt(str(formData, "sort_order") || "0", 10);

    const errors: Record<string, string> = {};
    if (!name) errors.name = "Name is required";
    if (!slug) errors.slug = "Slug is required";
    if (!Number.isInteger(sortOrder)) errors.sort_order = "Enter a valid number";
    if (Object.keys(errors).length > 0) {
      return { ok: false, message: "Please fix the errors below.", errors };
    }

    const payload = {
      name,
      slug,
      description: str(formData, "description") || null,
      sort_order: sortOrder,
      is_active: formData.get("is_active") === "on",
      updated_at: new Date().toISOString(),
    };

    const { error } = id
      ? await supabase.from("categories").update(payload).eq("id", id)
      : await supabase.from("categories").insert(payload);

    if (error) {
      if (error.code === "23505") {
        return { ok: false, errors: { slug: "Slug already in use" }, message: "Duplicate slug." };
      }
      return { ok: false, message: error.message };
    }

    revalidatePath("/admin/categories");
    return { ok: true, message: id ? "Category updated." : "Category created." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}

export interface ImageActionState {
  ok: boolean;
  message?: string;
}

export async function uploadCategoryImage(
  _prev: ImageActionState,
  formData: FormData
): Promise<ImageActionState> {
  try {
    await requireAdmin();
    const categoryId = str(formData, "category_id");
    const file = formData.get("file");
    if (!categoryId) return { ok: false, message: "Missing category." };
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, message: "Choose an image file first." };
    }
    if (!file.type.startsWith("image/")) {
      return { ok: false, message: "File must be an image." };
    }

    const supabase = createAdminClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `categories/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type });
    if (uploadError) return { ok: false, message: uploadError.message };

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("categories")
      .update({ image_url: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq("id", categoryId);
    if (updateError) return { ok: false, message: updateError.message };

    revalidatePath("/admin/categories");
    return { ok: true, message: "Image uploaded." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error" };
  }
}
