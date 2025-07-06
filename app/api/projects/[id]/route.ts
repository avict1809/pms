import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const projectId = params.id;

    // Get project with all related data
    const { data: project, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        project_members!project_members_project_id_fkey(
          user_id,
          role,
          users!project_members_user_id_fkey(
            id,
            display_name,
            email,
            role
          )
        ),
        tasks!tasks_project_id_fkey(
          id,
          title,
          description,
          status,
          priority,
          due_date,
          created_at,
          created_by,
          assigned_to,
          created_by_user:users!tasks_created_by_fkey(
            id,
            display_name,
            email
          ),
          assigned_to_user:users!tasks_assigned_to_fkey(
            id,
            display_name,
            email
          )
        ),
        financial_records!financial_records_project_id_fkey(
          id,
          amount,
          description,
          type,
          category,
          date,
          recorded_by,
          users!financial_records_recorded_by_fkey(
            id,
            display_name,
            email
          )
        ),
        files!files_project_id_fkey(
          id,
          filename,
          file_path,
          file_size,
          file_type,
          uploaded_at,
          users!files_uploaded_by_fkey(
            id,
            display_name,
            email
          )
        )
      `
      )
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
