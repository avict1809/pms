import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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
          setAll() {},
        },
      }
    );

    // Get all projects
    const { data: projects, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        supervisor:users!projects_supervisor_id_fkey(
          id,
          display_name,
          email
        ),
        created_by:users!projects_created_by_fkey(
          id,
          display_name,
          email
        ),
        project_members!project_members_project_id_fkey(
          user_id,
          role,
          users!project_members_user_id_fkey(
            id,
            display_name,
            email
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: projects });
  } catch (error) {
    console.error("Error in GET /api/projects/my-projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
