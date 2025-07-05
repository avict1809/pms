import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../supabase/client";

export async function GET(request: NextRequest) {
  try {
    // Get the user from the request headers (you'll need to pass this from the client)
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from the auth header (you'll need to implement this based on your auth strategy)
    const userId = authHeader.replace("Bearer ", "");

    // Get user's role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    let projectsQuery;

    if (userData?.role === "admin") {
      // Admins can see all projects
      projectsQuery = supabase
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
            display_name,
            email
          )
        `
        )
        .order("created_at", { ascending: false });
    } else {
      // Other users can only see projects they're members of
      projectsQuery = supabase
        .from("project_members")
        .select(
          `
          role,
          project:projects(
            id,
            title,
            description,
            status,
            created_at,
            updated_at,
            supervisor:users!projects_supervisor_id_fkey(
              display_name,
              email
            )
          )
        `
        )
        .eq("user_id", userId)
        .order("project.created_at", { ascending: false });
    }

    const { data, error } = await projectsQuery;

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    let projects;
    if (userData?.role === "admin") {
      projects = data;
    } else {
      // Transform the data for non-admin users
      projects = data?.map((item) => ({
        ...item.project,
        user_role: item.role,
      }));
    }

    // Get additional stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        // Get member count
        const { count: memberCount } = await supabase
          .from("project_members")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id);

        // Get task counts
        const { count: taskCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id);

        const { count: completedTaskCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id)
          .eq("status", "completed");

        return {
          ...project,
          member_count: memberCount || 0,
          task_count: taskCount || 0,
          completed_task_count: completedTaskCount || 0,
          user_role: project.user_role || "admin",
        };
      })
    );

    return NextResponse.json({ data: projectsWithStats });
  } catch (error) {
    console.error("Error in my-projects API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
