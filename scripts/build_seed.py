#!/usr/bin/env python3
"""
Generate `supabase/seed.sql` from `scripts/catalogue.json`.

The SQL is idempotent and mirrors exactly what `scripts/load-catalogue.mjs`
pushes to Supabase, so a fresh project can be seeded from the SQL editor alone.

Usage:  python3 scripts/build_seed.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOGUE = ROOT / "scripts" / "catalogue.json"
OUT = ROOT / "supabase" / "seed.sql"


def q(value) -> str:
    """Quote a Python value as a SQL literal."""
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def q_array(values) -> str:
    if not values:
        return "null"
    inner = ", ".join(q(v) for v in values)
    return f"array[{inner}]"


def slugify(text: str) -> str:
    return re.sub(r"(^-|-$)+", "", re.sub(r"[^a-z0-9]+", "-", text.lower()))


def main() -> int:
    data = json.loads(CATALOGUE.read_text())
    categories = data["categories"]
    products = data["products"]
    brands = sorted({p["brand"] for p in products if p["brand"]})

    out = []
    w = out.append

    w("-- Medhour Pharmacy — catalogue seed")
    w("--")
    w("-- GENERATED FILE — do not edit by hand.")
    w("--   python3 scripts/build_catalogue.py   (reads MEDHOUR PRICE LIST.xlsx)")
    w("--   python3 scripts/build_seed.py        (writes this file)")
    w("--")
    w(f"-- {len(products)} products in {len(categories)} categories, taken from the")
    w("-- pharmacy's own stock list. Prices are the sheet's Selling Price and stock")
    w("-- is its On Hand column, both copied verbatim.")
    w("--")
    w("-- No product images are seeded: every product starts with an empty image")
    w("-- container, to be filled in from Admin -> Products -> Edit -> Images.")
    w("")
    w("-- Run after the migrations in supabase/migrations/.")
    w("")

    w("-- ============ Categories ============")
    w("insert into public.categories (name, slug, description, image_url, sort_order, is_active) values")
    rows = [
        f"  ({q(c['name'])}, {q(c['slug'])}, {q(c['description'])}, null, {i + 1}, true)"
        for i, c in enumerate(categories)
    ]
    w(",\n".join(rows))
    w("on conflict (slug) do update set")
    w("  name = excluded.name,")
    w("  description = excluded.description,")
    w("  sort_order = excluded.sort_order;")
    w("")

    w("-- ============ Brands ============")
    w("insert into public.brands (name, slug) values")
    w(",\n".join(f"  ({q(b)}, {q(slugify(b))})" for b in brands))
    w("on conflict (slug) do nothing;")
    w("")

    w("-- ============ Products ============")
    w("with cat as (select id, slug from public.categories),")
    w("     br as (select id, name from public.brands)")
    w("insert into public.products")
    w("  (name, slug, internal_name, generic_name, brand_id, category_id, sku,")
    w("   short_description, keywords, pack_size, price, stock_quantity,")
    w("   low_stock_threshold, requires_prescription, is_featured, is_active)")
    w("values")

    rows = []
    for p in products:
        brand = (
            f"(select id from br where name = {q(p['brand'])})"
            if p["brand"]
            else "null"
        )
        rows.append(
            "  ("
            + ", ".join([
                q(p["name"]),
                q(p["slug"]),
                q(p["internal_name"]),
                q(p["generic_name"]),
                brand,
                f"(select id from cat where slug = {q(p['category'])})",
                q(p["sku"]),
                q(p["short_description"]),
                q_array(p["keywords"]),
                q(p["pack_size"]),
                q(p["price"]),
                q(p["stock_quantity"]),
                q(p["low_stock_threshold"]),
                "false",
                q(p["is_featured"]),
                "true",
            ])
            + ")"
        )
    w(",\n".join(rows))
    w("on conflict (slug) do update set")
    w("  name = excluded.name,")
    w("  internal_name = excluded.internal_name,")
    w("  generic_name = excluded.generic_name,")
    w("  brand_id = excluded.brand_id,")
    w("  category_id = excluded.category_id,")
    w("  sku = excluded.sku,")
    w("  short_description = excluded.short_description,")
    w("  keywords = excluded.keywords,")
    w("  pack_size = excluded.pack_size,")
    w("  price = excluded.price,")
    w("  stock_quantity = excluded.stock_quantity,")
    w("  low_stock_threshold = excluded.low_stock_threshold,")
    w("  is_featured = excluded.is_featured,")
    w("  updated_at = now();")
    w("")

    w("-- ============ Site settings ============")
    w("insert into public.site_settings (key, value) values")
    w("  ('phone', '+255 716 221 692'),")
    w("  ('whatsapp', '+255716221692'),")
    w("  ('email', 'info@medhour.co.tz'),")
    w("  ('opening_hours', 'Mon-Sat: 8:00 - 20:00, Sun: 9:00 - 18:00'),")
    w("  ('delivery_fee_dar', '3000')")
    w("on conflict (key) do nothing;")
    w("")

    OUT.write_text("\n".join(out))
    print(f"wrote {OUT.relative_to(ROOT)} — {len(products)} products, "
          f"{len(categories)} categories, {len(brands)} brands")
    return 0


if __name__ == "__main__":
    sys.exit(main())
