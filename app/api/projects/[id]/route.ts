import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Get project with all related data
    const { data: project, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        supervisor:users!projects_supervisor_id_fkey(
          id,
          display_name,
          email,
          role
        ),
        created_by_user:users!projects_created_by_fkey(
          id,
          display_name,
          email,
          role
        ),
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

    // For now, set a default user role since we can't get the current user
    // The frontend can handle role-based permissions based on the user context
    const projectWithStats = {
      ...project,
      user_role: "member", // Default role, frontend can override based on user context
      member_count: project.project_members?.length || 0,
      task_count: project.tasks?.length || 0,
      completed_task_count:
        project.tasks?.filter((task: any) => task.status === "completed")
          ?.length || 0,
      file_count: project.files?.length || 0,
    };

    return NextResponse.json({ data: projectWithStats });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
