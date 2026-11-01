import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // ignore set cookie errors in server components
          }
        },
      },
    }
  );
}

// Compatibility exports
export const createClient = createServerSupabaseClient;

export const supabaseServer = {
  from: (table: string) => createServerSupabaseClient().from(table as any),
  auth: {
    getUser: () => createServerSupabaseClient().auth.getUser(),
    getSession: () => createServerSupabaseClient().auth.getSession(),
  },
};

