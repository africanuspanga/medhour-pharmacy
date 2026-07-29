import { createClient } from "@/lib/supabase/server";
import type { Category, Product, ShopFilters } from "@/lib/types";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

const PRODUCT_SELECT = "*, category:categories(*), brand:brands(*), images:product_images(*)";

export async function getCategories(activeOnly = true): Promise<Category[]> {
  const supabase = await createClient();
  let query = supabase.from("categories").select("*").order("sort_order", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);
  const { data } = await query;
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).single();
  return (data as Category) ?? null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getProducts(filters: ShopFilters = {}): Promise<ProductListResult> {
  const supabase = await createClient();
  const page = Math.max(filters.page ?? 1, 1);
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_active", true);

  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
    else return { products: [], total: 0, page, totalPages: 0 };
  }

  if (filters.query) {
    const q = filters.query.trim();
    // Search across name, generic name, brand name, description and keywords.
    query = query.or(
      `name.ilike.%${q}%,generic_name.ilike.%${q}%,description.ilike.%${q}%,short_description.ilike.%${q}%`
    );
  }

  if (filters.requiresPrescription === "yes") query = query.eq("requires_prescription", true);
  if (filters.requiresPrescription === "no") query = query.eq("requires_prescription", false);
  if (filters.inStock) query = query.gt("stock_quantity", 0);
  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  return {
    products: (data ?? []) as unknown as Product[],
    total,
    page,
    totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return (data as unknown as Product) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!product.category_id) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}

/** Debounced-search endpoint helper — searches name, generic, brand, category, description, keywords. */
export async function searchProducts(q: string, limit = 8): Promise<Product[]> {
  const query = q.trim();
  if (!query) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .or(
      `name.ilike.%${query}%,generic_name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`
    )
    .order("name", { ascending: true })
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}

export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("slug").eq("is_active", true);
  return (data ?? []).map((p) => p.slug as string);
}
