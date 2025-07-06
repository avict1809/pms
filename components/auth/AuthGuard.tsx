"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "../../supabase/context";
import { supabase } from "../../supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "supervisor" | "student";
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, session, loading } = useSupabase();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
      return;
    }

    if (session && user) {
      // Get user role from our users table using Supabase client directly
      const fetchUserRole = async () => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching user role:", error);
            // For now, let's not redirect to login on error, just log it
            console.log("User ID:", user.id);
            console.log("Error details:", error);
            setCheckingRole(false);
            return;
          }

          console.log("User role fetched:", data.role);
          setUserRole(data.role);
          setCheckingRole(false);

          // Check if user has required role
          if (requiredRole && data.role !== requiredRole) {
            console.log(
              `User role ${data.role} doesn't match required role ${requiredRole}`
            );
            router.push("/");
            return;
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setCheckingRole(false);
        }
      };

      fetchUserRole();
    } else if (!loading && !session) {
      setCheckingRole(false);
    }
  }, [session, user, loading, router, requiredRole]);

  if (loading || checkingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-orange-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  if (requiredRole && userRole !== requiredRole) {
    return null; // Will redirect to home
  }

  return <>{children}</>;
}
