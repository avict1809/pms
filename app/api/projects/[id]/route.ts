import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Get the user from the request headers (you'll need to pass this from the client)
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from the auth header (you'll need to implement this based on your auth strategy)
    const userId = authHeader.replace("Bearer ", "");

    // First, check if user has access to this project
    const { data: memberData, error: memberError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    if (memberError || !memberData) {
      // Check if user is admin
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (!userData || userData.role !== "admin") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Fetch project details
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select(
        `
        id,
        title,
        description,
        status,
        created_at,
        updated_at,
        supervisor:users!projects_supervisor_id_fkey(
          id,
          display_name,
          email
        ),
        created_by:users!projects_created_by_fkey(
          id,
          display_name,
          email
        )
      `
      )
      .eq("id", projectId)
      .single();

    if (projectError) {
      console.error("Error fetching project:", projectError);
      return NextResponse.json(
        { error: "Failed to fetch project" },
        { status: 500 }
      );
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from("project_members")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    // Get task counts
    const { count: taskCount } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    const { count: completedTaskCount } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("status", "completed");

    // Get file count
    const { count: fileCount } = await supabase
      .from("files")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    // Determine user role in this project
    let userRole = "viewer";
    if (memberData) {
      userRole = memberData.role;
    } else {
      // Check if user is admin
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (userData && userData.role === "admin") {
        userRole = "admin";
      }
    }

    const projectWithStats = {
      ...projectData,
      member_count: memberCount || 0,
      task_count: taskCount || 0,
      completed_task_count: completedTaskCount || 0,
      file_count: fileCount || 0,
      user_role: userRole,
    };

    return NextResponse.json({ data: projectWithStats });
  } catch (error) {
    console.error("Error in project API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
