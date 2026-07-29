import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Update your Medhour Pharmacy account details.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
  const profile = data as Profile | null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">Profile</h2>
      <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
        <ProfileForm
          email={profile?.email ?? user!.email ?? ""}
          initialFullName={profile?.full_name ?? ""}
          initialPhone={profile?.phone ?? ""}
        />
      </div>
    </div>
  );
}
