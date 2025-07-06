"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import SignInForm from "../../../components/auth/SignInForm";
import { useSupabase } from "../../../supabase/context";
import { supabase } from "../../../supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { user, session, loading } = useSupabase();

  useEffect(() => {
    if (!loading && session && user) {
      // User is already authenticated, redirect to appropriate dashboard
      const redirectToDashboard = async () => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching user role:", error);
            router.push("/");
            return;
          }

          // Redirect based on role
          if (data.role === "admin") {
            router.push("/admin");
          } else if (data.role === "supervisor") {
            router.push("/supervisor");
          } else if (data.role === "student") {
            router.push("/student");
          } else {
            router.push("/");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          router.push("/");
        }
      };

      redirectToDashboard();
    }
  }, [session, user, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#23232a] to-black p-4">
        <div className="text-orange-400 text-lg">Loading...</div>
      </div>
    );
  }

  // If user is authenticated, don't show login form
  if (session && user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#23232a] to-black p-4">
        <div className="text-orange-400 text-lg">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#23232a] to-black p-4">
      <div className="w-full max-w-md">
        <SignInForm onSuccess={() => router.push("/")} />
      </div>
    </div>
  );
}
