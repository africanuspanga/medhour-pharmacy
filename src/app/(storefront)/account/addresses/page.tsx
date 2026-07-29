import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/lib/types";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = {
  title: "My Addresses",
  description: "Manage your saved delivery addresses for Medhour Pharmacy orders.",
};

export default async function AddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("customer_id", user!.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">Saved addresses</h2>
      <AddressManager addresses={(data ?? []) as Address[]} />
    </div>
  );
}
