import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password-reset link for your Medhour Pharmacy account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Reset your password</h1>
      <p className="mt-2 text-sm text-ink/60">
        Enter the email you registered with and we&apos;ll send you a reset link.
      </p>
      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
