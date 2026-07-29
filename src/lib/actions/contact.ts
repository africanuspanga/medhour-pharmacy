"use server";

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
 * Note: no email/notification service is configured yet, so a valid
 * submission is simply acknowledged. Wire this up to an email service
 * (e.g. Resend, SES) or persist messages to a Supabase table later.
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

  // TODO: send an email notification or store the message in Supabase here.
  return {
    status: "success",
    message: "Thank you for your message. We will get back to you as soon as we can.",
  };
}
