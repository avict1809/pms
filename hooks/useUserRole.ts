import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/supabase/context";

export interface UserRole {
  id: string;
  email: string;
  display_name: string;
  role: "admin" | "supervisor" | "student";
  is_active: boolean;
  is_first_login: boolean;
  created_at: string;
  password_set_at?: string;
}

export function useUserRole() {
  const { user, supabase } = useSupabase();

  return useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async (): Promise<UserRole | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
