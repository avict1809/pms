import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../supabase/client";

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
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

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    // Get member counts and task counts for each project
    const projectsWithStats = await Promise.all(
      data.map(async (project) => {
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
        };
      })
    );

    return NextResponse.json({ data: projectsWithStats });
  } catch (error) {
    console.error("Error in all-projects API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
