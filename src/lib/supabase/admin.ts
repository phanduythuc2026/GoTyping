import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

/**
 * Server-only Supabase client equipped with Service Role Key
 * Bypasses RLS for super admin administrative tasks.
 * NEVER import or execute this file in Client Components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-supabase.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-role-key-gotyping-internal";

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
