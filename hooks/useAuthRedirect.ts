import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "../supabase/context";

export function useAuthRedirect() {
  const router = useRouter();
  const { user, session, loading } = useSupabase();

  useEffect(() => {
    if (!loading && session && user) {
      // User is already authenticated, redirect to appropriate dashboard
      const redirectToDashboard = async () => {
        try {
          const { data, error } = await fetch("/api/user/role", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: user.id }),
          }).then((res) => res.json());

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

  return { user, session, loading };
}
