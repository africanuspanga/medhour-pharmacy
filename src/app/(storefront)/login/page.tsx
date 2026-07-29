import type { Metadata } from "next";
import { CartSync } from "@/components/auth/cart-sync";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Medhour Pharmacy account to view orders, addresses and prescriptions.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <CartSync />
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Sign in to your account</h1>
      <p className="mt-2 text-sm text-ink/60">
        Track your orders and manage your prescriptions with Medhour Pharmacy.
      </p>
      {error === "auth_callback" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
          That sign-in link was invalid or has expired. Please sign in or request a new link.
        </p>
      )}
      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
