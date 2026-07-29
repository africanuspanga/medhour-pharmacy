import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts } from "@/lib/data";
import { MEDICINE_DISCLAIMER, SITE, WHATSAPP_URL } from "@/lib/constants";
import { effectivePrice, formatTzs, stockStatus } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchase } from "@/components/storefront/product-purchase";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Required for `output: "export"` (static demo build); harmless otherwise. */
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const description =
    product.short_description ??
    product.description?.slice(0, 160) ??
    `Buy ${product.name} at ${SITE.name}, Dar es Salaam.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, description },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const price = effectivePrice(product);
  const onSale = product.sale_price != null && product.sale_price < product.price;
  const stock = stockStatus(product.stock_quantity);

  const whatsappHref = `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hello ${SITE.name}, I would like to enquire about ${product.name} (${formatTzs(price)}).`
  )}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description ?? product.description ?? undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    category: product.category?.name,
    image: product.images?.map((i) => i.image_url),
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/products/${product.slug}`,
      priceCurrency: "TZS",
      price: price,
      availability:
        product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const infoSections: { title: string; body: string | null }[] = [
    { title: "Product Information", body: product.description },
    { title: "Usage Information", body: product.usage_info },
    { title: "Important Warnings", body: product.warnings },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink/50">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-brand">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/shop" className="hover:text-brand">
              Shop
            </Link>
          </li>
          {product.category && (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link href={`/categories/${product.category.slug}`} className="hover:text-brand">
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>/</li>
          <li className="font-medium text-ink" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images ?? []} productName={product.name} />

        <div>
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-sm font-medium text-brand hover:text-brand-dark"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">{product.name}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/60">
            {product.generic_name && <span>{product.generic_name}</span>}
            {product.brand && <span>· {product.brand.name}</span>}
            {product.pack_size && <span>· {product.pack_size}</span>}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand-dark">{formatTzs(price)}</span>
            {onSale && <span className="text-base text-ink/40 line-through">{formatTzs(product.price)}</span>}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone={stock.tone === "in" ? "green" : stock.tone === "low" ? "amber" : "red"}>
              {stock.label}
            </Badge>
            <Badge tone={product.requires_prescription ? "blue" : "grey"}>
              {product.requires_prescription ? "Prescription required" : "No prescription needed"}
            </Badge>
          </div>

          {product.short_description && (
            <p className="mt-4 text-sm leading-relaxed text-ink/70">{product.short_description}</p>
          )}

          {product.requires_prescription && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              This product requires a valid prescription. You will be asked to upload it at checkout,
              and a pharmacist must approve it before your order is fulfilled.
            </div>
          )}

          <div className="mt-6">
            <ProductPurchase product={product} />
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand px-6 py-3 text-base font-semibold text-brand transition-colors hover:bg-brand-light sm:w-auto"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2a9.9 9.9 0 00-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1012.04 2zm0 1.8a8.1 8.1 0 110 16.2 8 8 0 01-4.1-1.1l-.3-.2-2.9.9 1-2.8-.2-.3a8.1 8.1 0 016.5-12.7zm-3.4 4c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.4.9 2.9.7 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4l-2-.9c-.3-.2-.5-.2-.7.1l-1 1.2c-.2.2-.4.3-.7.1a9.5 9.5 0 01-2.7-1.7 10 10 0 01-1.9-2.3c-.2-.3 0-.5.1-.7l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5L9.6 8.2c-.2-.4-.4-.4-.6-.4z" />
            </svg>
            Enquire on WhatsApp
          </a>
        </div>
      </div>

      {/* Info sections */}
      <div className="mt-12 max-w-3xl space-y-8">
        {infoSections
          .filter((s) => s.body)
          .map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-ink">{s.title}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/70">{s.body}</p>
            </section>
          ))}

        <p className="rounded-xl bg-surface px-4 py-3 text-xs leading-relaxed text-ink/60">
          {MEDICINE_DISCLAIMER}
        </p>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">Related Products</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
