import { createClient } from "@supabase/supabase-js";
import { getEnvSync } from "./env";

// Client-side access is static because NEXT_PUBLIC vars are bundled at build time
export const supabaseBrowser = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  : null;

// Server-side access MUST be dynamic (per-request) in Cloudflare Workers
export function assertSupabaseAdmin() {
  const supabaseUrl = getEnvSync("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceKey = getEnvSync("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}
