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

    // Fetch task to check access
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("project_id")
      .eq("id", params.id)
      .single();

    if (taskError) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user has access to this task's project
    const { data: projectMember, error: memberError } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", task.project_id)
      .eq("user_id", user.id)
      .single();

    if (memberError && userData.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch comments with user information
    const { data: comments, error: commentsError } = await supabase
      .from("task_comments")
      .select(`
        *,
        user:users!task_comments_user_id_fkey(
          id,
          display_name,
          email,
          role
        )
      `)
      .eq("task_id", params.id)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }

    return NextResponse.json({ data: comments });
  } catch (error) {
    console.error("Error in GET /api/tasks/[id]/comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
      .select("project_id")
      .eq("id", params.id)
      .single();

    if (taskError) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user has access to this task's project
    const { data: projectMember, error: memberError } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", task.project_id)
      .eq("user_id", user.id)
      .single();

    if (memberError && userData.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate required fields
    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    // Create comment
    const { data: comment, error: createError } = await supabase
      .from("task_comments")
      .insert({
        task_id: params.id,
        user_id: user.id,
        content: body.content.trim()
      })
      .select(`
        *,
        user:users!task_comments_user_id_fkey(
          id,
          display_name,
          email,
          role
        )
      `)
      .single();

    if (createError) {
      console.error("Error creating comment:", createError);
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/tasks/[id]/comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 