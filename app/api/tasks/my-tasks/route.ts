import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional query params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const dueThisWeek = searchParams.get("dueThisWeek") === "true";

    let query = supabase
      .from("tasks")
      .select("*", { count: "exact" })
      .eq("assigned_to", user.id);

    if (status) {
      query = query.eq("status", status);
    }

    if (dueThisWeek) {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      query = query
        .gte("due_date", startOfWeek.toISOString().slice(0, 10))
        .lte("due_date", endOfWeek.toISOString().slice(0, 10));
    }

    const { data: tasks, error } = await query;
    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: tasks });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
