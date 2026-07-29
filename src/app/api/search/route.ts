import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";

/** GET /api/search?q=... — JSON results for the debounced live search. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ products: [] });
  const products = await searchProducts(q, 24);
  return NextResponse.json({ products });
}
