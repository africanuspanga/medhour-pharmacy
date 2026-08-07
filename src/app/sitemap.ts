import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getAllProductSlugs, getCategories } from "@/lib/data";

// Regenerate periodically so new products/categories appear without a redeploy.
export const revalidate = 3600;

const staticRoutes: { path: string; changeFrequency: "daily" | "weekly" | "monthly"; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/delivery-info", changeFrequency: "monthly", priority: 0.6 },
  { path: "/prescriptions/upload", changeFrequency: "monthly", priority: 0.7 },
  { path: "/track-order", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy-policy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.3 },
  { path: "/returns-refunds", changeFrequency: "monthly", priority: 0.4 },
  { path: "/medicine-disclaimer", changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE.url}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Catalogue routes come from Supabase; fall back to static routes only if
  // the fetch fails so the sitemap never breaks.
  try {
    const [categories, productSlugs] = await Promise.all([getCategories(), getAllProductSlugs()]);

    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${SITE.url}/categories/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const productEntries: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
      url: `${SITE.url}/products/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...categoryEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
