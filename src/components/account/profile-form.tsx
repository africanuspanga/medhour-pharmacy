"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Spinner } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast";

export function ProfileForm({
  email,
  initialFullName,
  initialPhone,
}: {
  email: string;
  initialFullName: string;
  initialPhone: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await updateProfile(fullName, phone);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }
    toast("Profile updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Field label="Email address">
        <Input type="email" value={email} disabled readOnly className="bg-surface text-ink/60" />
      </Field>
      <Field label="Full name" required>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </Field>
      <Field label="Phone number">
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+255 …"
        />
      </Field>
      <Button type="submit" disabled={saving}>
        {saving ? <Spinner className="h-4 w-4 text-white" /> : null}
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
