import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when the Supabase URL and anon key are set, so league data can be read from the database. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const NO_SESSION = { auth: { persistSession: false, autoRefreshToken: false } } as const;

/**
 * Read-only client using the anon key. Row level security limits it to public reads.
 * @throws Error if the Supabase env vars are missing.
 */
export function getSupabaseReadClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the selected env file.");
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, NO_SESSION);
}

/**
 * Admin client using the service role key. Bypasses row level security, so only use it in Server Actions.
 * @throws Error if the Supabase URL or service role key is missing.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the selected env file.");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NO_SESSION);
}
