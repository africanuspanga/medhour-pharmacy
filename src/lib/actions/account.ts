"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AccountActionResult {
  error?: string;
}

export interface AddressInput {
  id?: string;
  label?: string;
  full_name: string;
  phone: string;
  region: string;
  district: string;
  address_line: string;
  landmark?: string;
  is_default?: boolean;
}

function validateAddress(input: AddressInput): string | null {
  if (!input.full_name.trim()) return "Please enter the recipient's full name.";
  if (!input.phone.trim()) return "Please enter a phone number.";
  if (!input.region.trim()) return "Please enter the region.";
  if (!input.district.trim()) return "Please enter the district.";
  if (!input.address_line.trim()) return "Please enter the street address.";
  return null;
}

export async function saveAddress(input: AddressInput): Promise<AccountActionResult> {
  const validationError = validateAddress(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to manage addresses." };

  const row = {
    customer_id: user.id,
    label: input.label?.trim() || null,
    full_name: input.full_name.trim(),
    phone: input.phone.trim(),
    region: input.region.trim(),
    district: input.district.trim(),
    address_line: input.address_line.trim(),
    landmark: input.landmark?.trim() || null,
    is_default: input.is_default ?? false,
  };

  // A default address should be the only default for this customer.
  if (row.is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("customer_id", user.id);
  }

  if (input.id) {
    // RLS enforces ownership; scoping by customer_id as well for safety.
    const { error } = await supabase
      .from("addresses")
      .update(row)
      .eq("id", input.id)
      .eq("customer_id", user.id);
    if (error) return { error: "Could not save the address. Please try again." };
  } else {
    const { error } = await supabase.from("addresses").insert(row);
    if (error) return { error: "Could not save the address. Please try again." };
  }

  revalidatePath("/account/addresses");
  return {};
}

export async function deleteAddress(id: string): Promise<AccountActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to manage addresses." };

  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("customer_id", user.id);
  if (error) return { error: "Could not delete the address. Please try again." };

  revalidatePath("/account/addresses");
  return {};
}

export async function updateProfile(fullName: string, phone: string): Promise<AccountActionResult> {
  const name = fullName.trim();
  if (!name) return { error: "Please enter your full name." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to update your profile." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: name, phone: phone.trim() || null })
    .eq("id", user.id);
  if (error) return { error: "Could not update your profile. Please try again." };

  revalidatePath("/account/profile");
  return {};
}
