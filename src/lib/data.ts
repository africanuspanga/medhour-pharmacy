import { createClient } from "@/lib/supabase/server";
import type { Category, Product, ShopFilters } from "@/lib/types";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS, supabaseConfigured } from "@/lib/fallback-data";

const PRODUCT_SELECT = "*, category:categories(*), brand:brands(*), images:product_images(*)";

// ---------- fallback helpers (used when Supabase is not configured) ----------

function fallbackProducts(filters: ShopFilters = {}): ProductListResult {
  let items = FALLBACK_PRODUCTS.filter((p) => p.is_active);

  if (filters.category) {
    items = items.filter((p) => p.category?.slug === filters.category);
  }
  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.generic_name?.toLowerCase().includes(q) ||
        p.brand?.name.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }
  if (filters.requiresPrescription === "yes") items = items.filter((p) => p.requires_prescription);
  if (filters.requiresPrescription === "no") items = items.filter((p) => !p.requires_prescription);
  if (filters.inStock) items = items.filter((p) => p.stock_quantity > 0);
  if (filters.minPrice != null) items = items.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) items = items.filter((p) => p.price <= filters.maxPrice!);

  switch (filters.sort) {
    case "price_asc":
      items = [...items].sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      items = [...items].sort((a, b) => b.price - a.price);
      break;
    case "name_asc":
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      items = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  const page = Math.max(filters.page ?? 1, 1);
  const total = items.length;
  const start = (page - 1) * PRODUCTS_PER_PAGE;
  return {
    products: items.slice(start, start + PRODUCTS_PER_PAGE),
    total,
    page,
    totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
  };
}

function fallbackSearch(q: string, limit: number): Product[] {
  return fallbackProducts({ query: q, sort: "name_asc", page: 1 }).products.slice(0, limit);
}

// ---------- public API (Supabase first, local fallback) ----------

export async function getCategories(activeOnly = true): Promise<Category[]> {
  if (!supabaseConfigured()) {
    return activeOnly ? FALLBACK_CATEGORIES.filter((c) => c.is_active) : FALLBACK_CATEGORIES;
  }
  try {
    const supabase = await createClient();
    let query = supabase.from("categories").select("*").order("sort_order", { ascending: true });
    if (activeOnly) query = query.eq("is_active", true);
    const { data, error } = await query;
    if (error) return FALLBACK_CATEGORIES.filter((c) => (activeOnly ? c.is_active : true));
    return (data ?? []) as Category[];
  } catch {
    return FALLBACK_CATEGORIES.filter((c) => (activeOnly ? c.is_active : true));
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!supabaseConfigured()) {
    return FALLBACK_CATEGORIES.find((c) => c.slug === slug && c.is_active) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single();
    if (error) return FALLBACK_CATEGORIES.find((c) => c.slug === slug) ?? null;
    return (data as Category) ?? null;
  } catch {
    return FALLBACK_CATEGORIES.find((c) => c.slug === slug) ?? null;
  }
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  if (!supabaseConfigured()) {
    return FALLBACK_PRODUCTS.filter((p) => p.is_featured).slice(0, limit);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return FALLBACK_PRODUCTS.filter((p) => p.is_featured).slice(0, limit);
    return (data ?? []) as unknown as Product[];
  } catch {
    return FALLBACK_PRODUCTS.filter((p) => p.is_featured).slice(0, limit);
  }
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getProducts(filters: ShopFilters = {}): Promise<ProductListResult> {
  if (!supabaseConfigured()) return fallbackProducts(filters);

  try {
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

    const { data, count, error } = await query.range(from, to);
    if (error) return fallbackProducts(filters);
    const total = count ?? 0;
    return {
      products: (data ?? []) as unknown as Product[],
      total,
      page,
      totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
    };
  } catch {
    return fallbackProducts(filters);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabaseConfigured()) {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (error) return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
    return (data as unknown as Product) ?? null;
  } catch {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!product.category_id) return [];
  if (!supabaseConfigured()) {
    return FALLBACK_PRODUCTS.filter((p) => p.category_id === product.category_id && p.id !== product.id).slice(
      0,
      limit
    );
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .limit(limit);
    if (error) {
      return FALLBACK_PRODUCTS.filter(
        (p) => p.category_id === product.category_id && p.id !== product.id
      ).slice(0, limit);
    }
    return (data ?? []) as unknown as Product[];
  } catch {
    return FALLBACK_PRODUCTS.filter((p) => p.category_id === product.category_id && p.id !== product.id).slice(
      0,
      limit
    );
  }
}

/** Debounced-search endpoint helper — searches name, generic, brand, category, description, keywords. */
export async function searchProducts(q: string, limit = 8): Promise<Product[]> {
  const query = q.trim();
  if (!query) return [];
  if (!supabaseConfigured()) return fallbackSearch(query, limit);
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .or(
        `name.ilike.%${query}%,generic_name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`
      )
      .order("name", { ascending: true })
      .limit(limit);
    if (error) return fallbackSearch(query, limit);
    return (data ?? []) as unknown as Product[];
  } catch {
    return fallbackSearch(query, limit);
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  if (!supabaseConfigured()) return FALLBACK_PRODUCTS.map((p) => p.slug);
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select("slug").eq("is_active", true);
    if (error) return FALLBACK_PRODUCTS.map((p) => p.slug);
    return (data ?? []).map((p) => p.slug as string);
  } catch {
    return FALLBACK_PRODUCTS.map((p) => p.slug);
  }
}
