import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
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

    // Check if user has access to this project
    const { data: projectMember, error: memberError } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", params.id)
      .eq("user_id", user.id)
      .single();

    if (memberError && userData.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch tasks with assigned user and creator information
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(
        `
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
      `
      )
      .eq("project_id", params.id)
      .order("created_at", { ascending: false });

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]/tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
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

    // Check if user can create tasks (admin, supervisor, or assigned student)
    const { data: projectMember, error: memberError } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", params.id)
      .eq("user_id", user.id)
      .single();

    if (memberError && userData.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // Create task
    const { data: task, error: createError } = await supabase
      .from("tasks")
      .insert({
        project_id: params.id,
        title: body.title.trim(),
        description: body.description || "",
        priority: body.priority || "medium",
        due_date: body.due_date || null,
        assigned_to: body.assigned_to || null,
        created_by: user.id,
        status: "todo",
      })
      .select(
        `
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
      `
      )
      .single();

    if (createError) {
      console.error("Error creating task:", createError);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/projects/[id]/tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
