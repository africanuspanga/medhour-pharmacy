import type { Metadata } from "next";
import Image from "next/image";
import { CartSync } from "@/components/auth/cart-sync";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Medhour Pharmacy account to view orders, addresses and prescriptions.",
};

const PERKS = [
  "Track your orders in real time",
  "Manage prescriptions & refills",
  "Faster checkout with saved addresses",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="bg-surface px-4 py-8 sm:py-14">
      <CartSync />
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-xl lg:min-h-[620px] lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative flex flex-col items-center justify-center bg-brand-light px-8 py-10 text-center lg:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-brand/10"
          />
          <Image
            src="/medhour-logo.png"
            alt="Medhour Pharmacy"
            width={1098}
            height={420}
            className="h-16 w-auto sm:h-20 lg:h-24"
            priority
          />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink/60 sm:text-base">
            Sign in to your Medhour Pharmacy account — your health, one hour at a time.
          </p>
          <ul className="mt-8 hidden space-y-3 text-left lg:block">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-sm font-medium text-ink/80">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4l3.3 3.3 7.3-7.3a1 1 0 0 1 1.4 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:py-16">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">Sign in to your account</h2>
          <p className="mt-1.5 text-sm text-ink/60">
            Track your orders and manage your prescriptions.
          </p>
          {error === "auth_callback" && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
              That sign-in link was invalid or has expired. Please sign in or request a new link.
            </p>
          )}
          <div className="mt-7">
            <LoginForm next={next} />
          </div>
        </div>
      </div>
    </div>
  );
}
