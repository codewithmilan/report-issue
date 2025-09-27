import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // Session persistence only in current browser tab/session
      persistSession: true,
      storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
    },
  }
);
