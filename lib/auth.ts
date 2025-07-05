import { supabase } from "../supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// Sign in with email and password
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

// Sign out
export async function signOut() {
  return supabase.auth.signOut();
}

// First-time password setup (update password for first login)
export async function setFirstTimePassword(email: string, password: string) {
  // Use Supabase admin API or a secure function to set password for first-time users
  // This is a placeholder; actual implementation may require a backend function
  return supabase.auth.updateUser({ password });
}

// Password reset (send reset email)
export async function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.NEXT_PUBLIC_APP_URL + "/auth/reset-password",
  });
}

// User activation status check (fetch user and check is_active)
export async function checkUserActivation(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("is_active")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data.is_active;
}
