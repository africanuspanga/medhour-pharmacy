"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/** Signs the current user out and sends them to the admin login page. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
