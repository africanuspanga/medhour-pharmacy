import Link from "next/link";
import type { Product } from "@/lib/types";
import { effectivePrice, formatTzs, stockStatus } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product/product-image";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  const price = effectivePrice(product);
  const onSale = product.sale_price != null && product.sale_price < product.price;
  const stock = stockStatus(product.stock_quantity);
  const image = product.images?.[0]?.image_url ?? null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square">
        <ProductImage src={image} alt={product.name} className="absolute inset-0" />
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-lime-300 px-2 py-0.5 text-xs font-bold text-ink">
            Sale
          </span>
        )}
        {product.requires_prescription && (
          <span className="absolute right-3 top-3">
            <Badge tone="blue">Rx Required</Badge>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.category && (
          <span className="text-xs font-medium text-ink/50">{product.category.name}</span>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-brand"
        >
          {product.name}
        </Link>
        {product.pack_size && <span className="text-xs text-ink/50">{product.pack_size}</span>}

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-bold text-brand-dark">{formatTzs(price)}</span>
          {onSale && (
            <span className="text-xs text-ink/40 line-through">{formatTzs(product.price)}</span>
          )}
        </div>

        <Badge tone={stock.tone === "in" ? "green" : stock.tone === "low" ? "amber" : "red"} className="w-fit">
          {stock.label}
        </Badge>

        <div className="mt-auto flex gap-2 pt-3">
          <AddToCartButton product={product} size="sm" className="flex-1" />
          <Link
            href={`/products/${product.slug}`}
            className="hidden items-center justify-center rounded-full border border-brand px-3 text-sm font-semibold text-brand transition-colors hover:bg-brand-light sm:inline-flex"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
