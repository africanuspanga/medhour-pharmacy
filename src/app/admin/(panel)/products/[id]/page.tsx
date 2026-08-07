import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Brand, Category, Product, ProductImage } from "@/lib/types";
import { ProductForm } from "../product-form";
import { ImageManager } from "../image-manager";

export const metadata: Metadata = { title: "Edit product — Admin" };

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }, { data: brands }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("brands").select("*").order("name"),
  ]);
  if (!product) notFound();

  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", id)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <Link href="/admin/products" className="text-sm text-ink/60 hover:text-brand">
          ← Products
        </Link>
        <h1 className="mt-1 text-xl font-bold text-ink">Edit product</h1>
        <p className="text-sm text-ink/60">{product.name}</p>
      </div>
      <ProductForm
        product={product as Product}
        categories={(categories ?? []) as Category[]}
        brands={(brands ?? []) as Brand[]}
      />
      <ImageManager productId={id} images={(images ?? []) as ProductImage[]} />
    </div>
  );
}
