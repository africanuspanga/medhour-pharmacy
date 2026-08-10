import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CartSync } from "@/components/auth/cart-sync";
import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <CartSync />
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">My Account</h1>
      <p className="mt-1 break-all text-sm text-ink/60">{user.email}</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-[220px_1fr]">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
