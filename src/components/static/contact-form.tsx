"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-brand-light p-6 text-center">
        <p className="font-semibold text-brand-dark">Message sent</p>
        <p className="mt-1 text-sm text-ink/70">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Your name" required error={state.fieldErrors?.name}>
        <Input name="name" required autoComplete="name" placeholder="Full name" />
      </Field>
      <Field label="Email or phone number" required error={state.fieldErrors?.contact}>
        <Input name="contact" required autoComplete="email" placeholder="you@example.com or +255 ..." />
      </Field>
      <Field label="Message" required error={state.fieldErrors?.message}>
        <Textarea name="message" required placeholder="How can we help you?" />
      </Field>
      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
      <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
