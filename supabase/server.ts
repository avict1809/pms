import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if service role key is available
if (!supabaseServiceKey) {
  console.warn(
    "⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. Server-side admin operations may fail."
  );
  console.warn(
    "💡 Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file from your Supabase dashboard."
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Regular server-side client for authentication
export const supabase = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
