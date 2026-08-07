import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const q = sp.get("q");
  const status = sp.get("status");
  const payment = sp.get("payment");

  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select(
      "order_number, created_at, customer_name, phone, email, delivery_method, total_amount, payment_method, payment_status, order_status"
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  if (q) {
    query = query.or(
      `order_number.ilike.%${q}%,customer_name.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }
  if (status) query = query.eq("order_status", status);
  if (payment) query = query.eq("payment_status", payment);

  const { data: orders, error } = await query;
  if (error) return new Response(error.message, { status: 500 });

  const header = [
    "order_number",
    "created_at",
    "customer_name",
    "phone",
    "email",
    "delivery_method",
    "total_amount",
    "payment_method",
    "payment_status",
    "order_status",
  ];

  const lines = [header.join(",")];
  for (const order of orders ?? []) {
    lines.push(
      [
        order.order_number,
        order.created_at,
        order.customer_name,
        order.phone,
        order.email,
        order.delivery_method,
        order.total_amount,
        order.payment_method,
        order.payment_status,
        order.order_status,
      ]
        .map(csvCell)
        .join(",")
    );
  }

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
