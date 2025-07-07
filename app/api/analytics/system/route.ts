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

    // Get user count
    const { count: userCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get project count
    const { count: projectCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get pending proposal count
    const { count: proposalCount } = await supabase
      .from("project_proposals")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Get announcement count
    const { count: announcementCount } = await supabase
      .from("announcements")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Calculate pending actions (pending proposals + other pending items)
    const pendingActions = proposalCount || 0;

    // Get total budget from projects
    const { data: projects } = await supabase
      .from("projects")
      .select("budget")
      .not("budget", "is", null);

    const totalBudget =
      projects?.reduce((sum, project) => {
        return sum + (project.budget || 0);
      }, 0) || 0;

    const stats = {
      users: userCount || 0,
      projects: projectCount || 0,
      proposals: proposalCount || 0,
      announcements: announcementCount || 0,
      pendingActions,
      totalBudget,
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("Error in GET /api/analytics/system:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
