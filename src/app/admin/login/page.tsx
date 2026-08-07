import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminProfile } from "@/lib/supabase/admin-auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in as admin → straight to the dashboard.
  const admin = await getAdminProfile();
  if (admin) redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-dark px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/5"
      />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/medhour-logo.png"
              alt="Medhour Pharmacy"
              width={1098}
              height={420}
              className="h-14 w-auto sm:h-16"
              priority
            />
            <span className="mt-3 rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              Admin
            </span>
            <h1 className="mt-4 text-2xl font-bold text-ink">Admin sign in</h1>
            <p className="mt-1.5 text-sm text-ink/60">
              Restricted area — authorized pharmacy staff only.
            </p>
          </div>
          <div className="mt-8">
            <LoginForm next="/admin" showSignUpLink={false} />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-white/70">
          Not staff?{" "}
          <Link href="/login" className="font-medium text-white underline underline-offset-2">
            Customer sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
