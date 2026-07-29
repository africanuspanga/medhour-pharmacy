"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Spinner } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast";

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const result = await signUp(fullName, email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }
    if (result.confirmEmail) {
      setRegistered(true);
    } else {
      toast("Account created. Welcome to Medhour Pharmacy!");
      router.push("/account");
      router.refresh();
    }
  }

  if (registered) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light">
          <svg className="h-6 w-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-ink">Check your email</h2>
        <p className="mt-2 text-sm text-ink/60">
          We&apos;ve sent a confirmation link to <span className="font-medium text-ink">{email}</span>.
          Open it to activate your account, then sign in.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/login")}>
          Go to Sign In
        </Button>
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
      <Field label="Full name" required>
        <Input
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Asha Moyo"
          required
        />
      </Field>
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
      <Field label="Password" required>
        <Input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          required
        />
      </Field>
      <Field label="Confirm password" required>
        <Input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Spinner className="h-4 w-4 text-white" /> : null}
        {loading ? "Creating account…" : "Create Account"}
      </Button>
      <p className="text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
