"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/constants";

export interface AuthResult {
  error?: string;
  /** true when the user must confirm their email before signing in */
  confirmEmail?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email address before signing in.";
  if (m.includes("user already registered")) return "An account with this email already exists. Try signing in instead.";
  if (m.includes("password")) return "Password must be at least 6 characters.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
  return message;
}

/** Base URL for auth redirect links (email confirmation, password reset). */
async function getSiteUrl(): Promise<string> {
  const hdrs = await headers();
  return process.env.NEXT_PUBLIC_SITE_URL ?? hdrs.get("origin") ?? SITE.url;
}

export async function signUp(fullName: string, email: string, password: string): Promise<AuthResult> {
  const name = fullName.trim();
  if (!name) return { error: "Please enter your full name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The handle_new_user DB trigger copies this into public.profiles.
      data: { full_name: name },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) return { error: friendlyAuthError(error.message) };
  // No session means email confirmation is required before sign-in.
  return { confirmEmail: !data.session };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (!password) return { error: "Please enter your password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendlyAuthError(error.message) };
  return {};
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // The caller (client) navigates after this resolves.
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: friendlyAuthError(error.message) };
  return {};
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  if (newPassword.length < 6) return { error: "Password must be at least 6 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: friendlyAuthError(error.message) };
  return {};
}
