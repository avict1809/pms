import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch task with project and user information
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(`
        *,
        project:projects!tasks_project_id_fkey(
          id,
          title,
          status
        ),
        assigned_to:users!tasks_assigned_to_fkey(
          id,
          display_name,
          email
        ),
        created_by:users!tasks_created_by_fkey(
          id,
          display_name,
          email
        )
      `)
      .eq("id", params.id)
      .single();

    if (taskError) {
      console.error("Error fetching task:", taskError);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user has access to this task
    const { data: projectMember, error: memberError } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", task.project_id)
      .eq("user_id", user.id)
      .single();

    if (memberError && userData.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error("Error in GET /api/tasks/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch task to check access
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*, project:projects!tasks_project_id_fkey(*)")
      .eq("id", params.id)
      .single();

    if (taskError) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user can edit this task
    const { data: projectMember, error: memberError } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", task.project_id)
      .eq("user_id", user.id)
      .single();

    const canEdit = userData.role === "admin" || 
                   userData.role === "supervisor" || 
                   (userData.role === "student" && task.assigned_to === user.id);

    if (!canEdit && memberError) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;

    // Update task
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        assigned_to:users!tasks_assigned_to_fkey(
          id,
          display_name,
          email
        ),
        created_by:users!tasks_created_by_fkey(
          id,
          display_name,
          email
        )
      `)
      .single();

    if (updateError) {
      console.error("Error updating task:", updateError);
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }

    return NextResponse.json({ data: updatedTask });
  } catch (error) {
    console.error("Error in PATCH /api/tasks/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch task to check access
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*, project:projects!tasks_project_id_fkey(*)")
      .eq("id", params.id)
      .single();

    if (taskError) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user can delete this task (only admin and supervisor)
    const { data: projectMember, error: memberError } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", task.project_id)
      .eq("user_id", user.id)
      .single();

    const canDelete = userData.role === "admin" || 
                     (userData.role === "supervisor" && !memberError);

    if (!canDelete) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete task
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Error deleting task:", deleteError);
      return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/tasks/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 