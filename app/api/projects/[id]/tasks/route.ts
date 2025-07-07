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

    // Get tasks for the project
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(
        `
        *,
        created_by:users!tasks_created_by_fkey(display_name, email),
        assigned_to:users!tasks_assigned_to_fkey(display_name, email)
      `
      )
      .eq("project_id", projectId)
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

    const body = await request.json();
    const { title, description, priority, assigned_to, due_date } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create new task
    const { data: task, error: createError } = await supabase
      .from("tasks")
      .insert({
        project_id: params.id,
        title: title,
        description: description || null,
        priority: priority || "medium",
        status: "pending",
        assigned_to: assigned_to || null,
        due_date: due_date || null,
        created_by: null, // Anonymous creation
      })
      .select(
        `
        *,
        created_by:users!tasks_created_by_fkey(display_name, email),
        assigned_to:users!tasks_assigned_to_fkey(display_name, email)
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
