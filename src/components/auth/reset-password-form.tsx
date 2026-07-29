"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Spinner } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast";

export function ResetPasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }
    toast("Password updated. You're signed in.");
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Field label="New password" required>
        <Input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          required
        />
      </Field>
      <Field label="Confirm new password" required>
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
        {loading ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
