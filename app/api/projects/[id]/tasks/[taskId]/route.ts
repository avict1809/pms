import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this project
    const { data: projectAccess, error: accessError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (accessError && !projectAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(
        `
        *,
        created_by:users!tasks_created_by_fkey(display_name, email),
        assigned_to:users!tasks_assigned_to_fkey(display_name, email)
      `
      )
      .eq("id", params.taskId)
      .eq("project_id", projectId)
      .single();

    if (taskError) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]/tasks/[taskId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this project
    const { data: projectAccess, error: accessError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (accessError && !projectAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, priority, status, assigned_to, due_date } =
      body;

    // Update task
    const { data: task, error: updateError } = await supabase
      .from("tasks")
      .update({
        title: title,
        description: description,
        priority: priority,
        status: status,
        assigned_to: assigned_to,
        due_date: due_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.taskId)
      .eq("project_id", projectId)
      .select(
        `
        *,
        created_by:users!tasks_created_by_fkey(display_name, email),
        assigned_to:users!tasks_assigned_to_fkey(display_name, email)
      `
      )
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error("Error in PUT /api/projects/[id]/tasks/[taskId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this project
    const { data: projectAccess, error: accessError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (accessError && !projectAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete task
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", params.taskId)
      .eq("project_id", projectId);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/projects/[id]/tasks/[taskId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
