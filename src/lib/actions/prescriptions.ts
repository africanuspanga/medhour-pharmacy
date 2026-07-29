"use server";

import { createClient } from "@/lib/supabase/server";

export const PRESCRIPTION_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
export const PRESCRIPTION_ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export interface PrescriptionResult {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function sanitizeFilename(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
  return cleaned || "prescription";
}

export async function submitPrescription(formData: FormData): Promise<PrescriptionResult> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const fulfilment = String(formData.get("fulfilment_method") ?? "").trim();
  const deliveryAddress = String(formData.get("delivery_address") ?? "").trim();
  const file = formData.get("file");

  const fieldErrors: Record<string, string> = {};
  if (!fullName) fieldErrors.full_name = "Please enter your full name.";
  if (!phone) fieldErrors.phone = "Please enter a phone number we can reach you on.";
  if (fulfilment !== "delivery" && fulfilment !== "pickup") {
    fieldErrors.fulfilment_method = "Please choose delivery or pickup.";
  }
  if (fulfilment === "delivery" && !deliveryAddress) {
    fieldErrors.delivery_address = "Please enter the delivery address.";
  }
  if (!(file instanceof File) || file.size === 0) {
    fieldErrors.file = "Please attach your prescription (JPG, PNG or PDF).";
  } else {
    if (!PRESCRIPTION_ACCEPTED_TYPES.includes(file.type)) {
      fieldErrors.file = "Only JPG, PNG or PDF files are accepted.";
    } else if (file.size > PRESCRIPTION_MAX_SIZE) {
      fieldErrors.file = "The file must be 10 MB or smaller.";
    }
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Upload to the PRIVATE prescriptions bucket. Never expose a public URL.
  const owner = user?.id ?? "guest";
  const path = `${owner}/${crypto.randomUUID()}-${sanitizeFilename((file as File).name)}`;
  const { error: uploadError } = await supabase.storage.from("prescriptions").upload(path, file as File, {
    contentType: (file as File).type,
  });
  if (uploadError) {
    return { error: "We could not upload your prescription. Please try again." };
  }

  const { error: insertError } = await supabase.from("prescriptions").insert({
    customer_id: user?.id ?? null,
    customer_name: fullName,
    phone,
    file_path: path,
    notes: notes || null,
    fulfilment_method: fulfilment,
    delivery_address: fulfilment === "delivery" ? deliveryAddress : null,
    status: "pending",
  });
  if (insertError) {
    return { error: "Your file was uploaded but we could not save the request. Please contact us on WhatsApp." };
  }

  return { success: true };
}
