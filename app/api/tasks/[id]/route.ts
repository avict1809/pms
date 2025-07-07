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

    // Get task with project and user details
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(
        `
        *,
        project:projects!tasks_project_id_fkey(
          id,
          title,
          project_members!project_members_project_id_fkey(
            user_id,
            role
          )
        ),
        created_by:users!tasks_created_by_fkey(display_name, email),
        assigned_to:users!tasks_assigned_to_fkey(display_name, email)
      `
      )
      .eq("id", projectId)
      .single();

    if (taskError) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error("Error in GET /api/tasks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
      .eq("id", projectId)
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
    console.error("Error in PUT /api/tasks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete task
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", projectId);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/tasks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
