"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    name?: string;
    contact?: string;
    message?: string;
  };
}

/**
 * Handles the contact form on /contact.
 *
 * Valid submissions are stored in the `contact_messages` table and can be
 * reviewed in the admin dashboard (/admin/messages). The service-role client
 * is used because submitters are anonymous guests.
 */
export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const fieldErrors: ContactFormState["fieldErrors"] = {};
  if (name.length < 2) fieldErrors.name = "Please enter your name.";
  if (contact.length < 5) fieldErrors.contact = "Please enter a valid email address or phone number.";
  if (message.length < 10) fieldErrors.message = "Please tell us a little more (at least 10 characters).";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name, contact, message });
    if (error) throw error;
  } catch (err) {
    console.error("submitContactForm failed:", err);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again or reach us on WhatsApp.",
    };
  }

  return {
    status: "success",
    message: "Thank you for your message. We will get back to you as soon as we can.",
  };
}
