import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Returns the current user's profile when they are an admin, else null. */
export async function getAdminProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return null;
  return profile as Profile;
}

/** Throws unless the current user is an authenticated admin. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getAdminProfile();
  if (!profile) {
    throw new Error("Unauthorized: admin access required");
  }
  return profile;
}
