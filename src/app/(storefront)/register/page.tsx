import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Medhour Pharmacy account to order medicines, track deliveries and manage prescriptions.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-ink/60">
        Save addresses, track orders and upload prescriptions faster.
      </p>
      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <RegisterForm />
      </div>
    </div>
  );
}
