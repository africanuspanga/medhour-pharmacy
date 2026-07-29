"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  submitPrescription,
  PRESCRIPTION_ACCEPTED_TYPES,
  PRESCRIPTION_MAX_SIZE,
} from "@/lib/actions/prescriptions";
import { WHATSAPP_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast";

const ACCEPT_ATTR = "image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf";

export function PrescriptionUploadForm() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleFileChange(selected: File | null) {
    setFieldErrors((prev) => ({ ...prev, file: "" }));
    if (!selected) {
      setFile(null);
      return;
    }
    if (!PRESCRIPTION_ACCEPTED_TYPES.includes(selected.type)) {
      setFile(null);
      setFieldErrors((prev) => ({ ...prev, file: "Only JPG, PNG or PDF files are accepted." }));
      return;
    }
    if (selected.size > PRESCRIPTION_MAX_SIZE) {
      setFile(null);
      setFieldErrors((prev) => ({ ...prev, file: "The file must be 10 MB or smaller." }));
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.full_name = "Please enter your full name.";
    if (!phone.trim()) errors.phone = "Please enter a phone number we can reach you on.";
    if (!file) errors.file = "Please attach your prescription (JPG, PNG or PDF).";
    if (fulfilment === "delivery" && !deliveryAddress.trim()) {
      errors.delivery_address = "Please enter the delivery address.";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const formData = new FormData();
    formData.set("full_name", fullName);
    formData.set("phone", phone);
    formData.set("notes", notes);
    formData.set("fulfilment_method", fulfilment);
    formData.set("delivery_address", deliveryAddress);
    formData.set("file", file!);

    setSubmitting(true);
    const result = await submitPrescription(formData);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }
    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      return;
    }
    setSubmitted(true);
    toast("Prescription submitted");
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light">
          <svg className="h-6 w-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-ink">Prescription received</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
          Thank you, {fullName.split(" ")[0]}. Our pharmacist will review your prescription and
          contact you on <span className="font-medium text-ink">{phone}</span> to confirm availability
          and price before we prepare your order.
        </p>
        <a
          href={`${WHATSAPP_URL}?text=${encodeURIComponent(
            "Hello Medhour Pharmacy, I just uploaded a prescription and would like to follow up."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand-light"
        >
          Follow up on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink/10 bg-white p-5 sm:p-6" noValidate>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={fieldErrors.full_name}>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        </Field>
        <Field label="Phone number" required error={fieldErrors.phone}>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="+255 …"
            required
          />
        </Field>
      </div>

      <Field label="Prescription file" required error={fieldErrors.file}>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-6 text-sm transition-colors",
            file
              ? "border-brand bg-brand-light text-brand-dark"
              : "border-ink/20 bg-surface text-ink/60 hover:border-brand hover:text-brand"
          )}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
          </svg>
          {file ? `${file.name} (${Math.ceil(file.size / 1024)} KB)` : "Tap to choose a JPG, PNG or PDF (max 10 MB)"}
        </button>
      </Field>

      <Field label="How would you like to receive your medicine?" required error={fieldErrors.fulfilment_method}>
        <div className="flex gap-3">
          {(["delivery", "pickup"] as const).map((option) => (
            <label
              key={option}
              className={cn(
                "flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                fulfilment === option
                  ? "border-brand bg-brand-light text-brand-dark"
                  : "border-ink/15 text-ink/70 hover:border-brand/50"
              )}
            >
              <input
                type="radio"
                name="fulfilment_method"
                value={option}
                checked={fulfilment === option}
                onChange={() => setFulfilment(option)}
                className="accent-brand"
              />
              {option === "delivery" ? "Delivery" : "Pickup at the pharmacy"}
            </label>
          ))}
        </div>
      </Field>

      {fulfilment === "delivery" && (
        <Field label="Delivery address" required error={fieldErrors.delivery_address}>
          <Textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Street, area, district — plus a landmark if helpful"
          />
        </Field>
      )}

      <Field label="Notes for the pharmacist (optional)">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Dosage questions, allergies, alternatives you're open to…"
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? <Spinner className="h-4 w-4 text-white" /> : null}
        {submitting ? "Uploading…" : "Submit Prescription"}
      </Button>
    </form>
  );
}
