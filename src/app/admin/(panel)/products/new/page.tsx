import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Brand, Category } from "@/lib/types";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Add product — Admin" };

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("brands").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <Link href="/admin/products" className="text-sm text-ink/60 hover:text-brand">
          ← Products
        </Link>
        <h1 className="mt-1 text-xl font-bold text-ink">Add product</h1>
      </div>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        brands={(brands ?? []) as Brand[]}
      />
      <p className="text-sm text-ink/50">Save the product first to upload images.</p>
    </div>
  );
}
