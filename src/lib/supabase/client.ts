import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client (uses the anon key, respects RLS). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
