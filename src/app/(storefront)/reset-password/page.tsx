import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Choose a new password for your Medhour Pharmacy account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Choose a new password</h1>
      <p className="mt-2 text-sm text-ink/60">
        You followed a recovery link, so you&apos;re securely signed in. Set your new password below.
      </p>
      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
