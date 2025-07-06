import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        user: null,
        supabase: null,
        error: { message: "Unauthorized", status: 401 },
      };
    }

    // Get user role from our users table
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role, display_name, email")
      .eq("id", user.id)
      .single();

    if (roleError || !userData) {
      return {
        user: null,
        supabase: null,
        error: { message: "User not found", status: 404 },
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: userData.role,
        display_name: userData.display_name,
      },
      supabase,
      error: null,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      user: null,
      supabase: null,
      error: { message: "Authentication failed", status: 500 },
    };
  }
}

export function createErrorResponse(message: string, status: number = 401) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json({ data }, { status });
}
