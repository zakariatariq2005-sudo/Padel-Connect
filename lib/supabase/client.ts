import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in the browser (client-side).
 * This client is used for authentication and database operations from React components.
 * 
 * The SUPABASE_URL and SUPABASE_ANON_KEY should be stored in your .env.local file
 * for security. Never commit these values to version control.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}


