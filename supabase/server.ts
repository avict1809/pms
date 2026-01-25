import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if service role key is available
if (!supabaseServiceKey) {
  console.error(
    "❌ SUPABASE_SERVICE_ROLE_KEY is not set. Server-side admin operations WILL FAIL."
  );
  console.error(
    "💡 SOLUTION: Add SUPABASE_SERVICE_ROLE_KEY to your .env file from your Supabase dashboard."
  );
  console.error(
    "📍 Location: Supabase Dashboard > Settings > API > Service Role Key"
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey!, // Force service key - will throw error if not set
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
