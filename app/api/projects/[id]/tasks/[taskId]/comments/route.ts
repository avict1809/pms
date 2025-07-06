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
      .eq("project_id", params.id)
      .eq("user_id", user.id)
      .single();

    if (accessError && !projectAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get comments for the task
    const { data: comments, error: commentsError } = await supabase
      .from("task_comments")
      .select(
        `
        *,
        user:users!task_comments_user_id_fkey(display_name, email)
      `
      )
      .eq("task_id", params.taskId)
      .order("created_at", { ascending: true });

    if (commentsError) {
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: comments });
  } catch (error) {
    console.error(
      "Error in GET /api/projects/[id]/tasks/[taskId]/comments:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
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
      .eq("project_id", params.id)
      .eq("user_id", user.id)
      .single();

    if (accessError && !projectAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Create new comment
    const { data: comment, error: createError } = await supabase
      .from("task_comments")
      .insert({
        task_id: params.taskId,
        content: content.trim(),
        user_id: user.id,
      })
      .select(
        `
        *,
        user:users!task_comments_user_id_fkey(display_name, email)
      `
      )
      .single();

    if (createError) {
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: comment });
  } catch (error) {
    console.error(
      "Error in POST /api/projects/[id]/tasks/[taskId]/comments:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
