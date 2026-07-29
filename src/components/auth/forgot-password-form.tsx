"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Spinner } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast";

export function ForgotPasswordForm() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await requestPasswordReset(email.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light">
          <svg className="h-6 w-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-ink">Reset link sent</h2>
        <p className="mt-2 text-sm text-ink/60">
          If an account exists for <span className="font-medium text-ink">{email}</span>, we&apos;ve
          sent a password-reset link. Follow it to choose a new password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-brand hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Field label="Email address" required>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Spinner className="h-4 w-4 text-white" /> : null}
        {loading ? "Sending…" : "Send Reset Link"}
      </Button>
      <p className="text-center text-sm text-ink/60">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Back to Sign In
        </Link>
      </p>
    </form>
  );
}
