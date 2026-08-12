/**
 * Replace the Supabase catalogue with the real Medhour Pharmacy stock list.
 *
 * Reads scripts/catalogue.json (produced by scripts/build_catalogue.py) and:
 *   1. deletes every existing product, product image, brand and category
 *   2. inserts the 17 real categories and the brands found in the price list
 *   3. inserts every product with its price and on-hand stock
 *
 * Order history is preserved: order_items.product_id is ON DELETE SET NULL and
 * each row already stores product_name, pack_size and unit_price.
 *
 * No images are created — every product starts with an empty image container
 * for the pharmacy to fill in from Admin → Products → Edit → Images.
 *
 * Usage:
 *   node --env-file=.env.local scripts/load-catalogue.mjs [--dry-run]
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/load-catalogue.mjs"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const catalogue = JSON.parse(
  readFileSync(join(HERE, "catalogue.json"), "utf8")
);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function check(label, { error }) {
  if (error) {
    console.error(`✗ ${label}: ${error.message}`);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
}

async function main() {
  const { products, categories } = catalogue;
  console.log(
    `Catalogue: ${products.length} products, ${categories.length} categories\n`
  );

  if (DRY_RUN) {
    console.table(
      products.slice(0, 15).map((p) => ({
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock_quantity,
      }))
    );
    console.log("\nDry run — nothing was written.");
    return;
  }

  // ---- 1. clear the old sample catalogue ---------------------------------
  const before = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  console.log(`Removing ${before.count ?? 0} existing products…`);

  check(
    "deleted product images",
    await supabase
      .from("product_images")
      .delete()
      .not("id", "is", null)
  );
  check(
    "deleted stock movements",
    await supabase
      .from("inventory_movements")
      .delete()
      .not("id", "is", null)
  );
  check(
    "deleted cart items",
    await supabase.from("cart_items").delete().not("id", "is", null)
  );
  check(
    "deleted products",
    await supabase.from("products").delete().not("id", "is", null)
  );
  check(
    "deleted brands",
    await supabase.from("brands").delete().not("id", "is", null)
  );
  check(
    "deleted categories",
    await supabase.from("categories").delete().not("id", "is", null)
  );

  // ---- 2. categories -----------------------------------------------------
  const categoryRows = categories.map((c, i) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_url: null, // the pharmacy uploads these from the admin dashboard
    sort_order: i + 1,
    is_active: true,
  }));
  const { data: insertedCategories, error: catError } = await supabase
    .from("categories")
    .insert(categoryRows)
    .select("id, slug");
  if (catError) {
    console.error(`✗ categories: ${catError.message}`);
    process.exit(1);
  }
  const categoryId = Object.fromEntries(
    insertedCategories.map((c) => [c.slug, c.id])
  );
  console.log(`✓ inserted ${insertedCategories.length} categories`);

  // ---- 3. brands ---------------------------------------------------------
  const brandNames = [
    ...new Set(products.map((p) => p.brand).filter(Boolean)),
  ].sort();
  const { data: insertedBrands, error: brandError } = await supabase
    .from("brands")
    .insert(brandNames.map((name) => ({ name, slug: slugify(name) })))
    .select("id, name");
  if (brandError) {
    console.error(`✗ brands: ${brandError.message}`);
    process.exit(1);
  }
  const brandId = Object.fromEntries(insertedBrands.map((b) => [b.name, b.id]));
  console.log(`✓ inserted ${insertedBrands.length} brands`);

  // ---- 4. products -------------------------------------------------------
  const rows = products.map((p) => ({
    name: p.name,
    slug: p.slug,
    internal_name: p.internal_name,
    generic_name: p.generic_name,
    brand_id: p.brand ? brandId[p.brand] : null,
    category_id: categoryId[p.category],
    sku: p.sku,
    short_description: p.short_description,
    description: null,
    usage_info: null,
    warnings: null,
    keywords: p.keywords.length ? p.keywords : null,
    pack_size: p.pack_size,
    price: p.price,
    sale_price: null,
    stock_quantity: p.stock_quantity,
    low_stock_threshold: p.low_stock_threshold,
    requires_prescription: false,
    is_featured: p.is_featured,
    is_active: true,
  }));

  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("products").insert(batch);
    if (error) {
      console.error(`✗ products ${i}–${i + batch.length}: ${error.message}`);
      process.exit(1);
    }
    inserted += batch.length;
    process.stdout.write(`\r  inserted ${inserted}/${rows.length} products`);
  }
  console.log("");

  // ---- 5. verify ---------------------------------------------------------
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  const { count: imageCount } = await supabase
    .from("product_images")
    .select("*", { count: "exact", head: true });

  console.log(`\n✓ done — ${count} products live, ${imageCount} images (expected 0)`);

  const totalStock = products.reduce((n, p) => n + p.stock_quantity, 0);
  const totalValue = products.reduce(
    (n, p) => n + p.price * p.stock_quantity,
    0
  );
  console.log(`  stock on hand: ${totalStock.toLocaleString()} units`);
  console.log(
    `  retail value:  TZS ${Math.round(totalValue).toLocaleString()}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
