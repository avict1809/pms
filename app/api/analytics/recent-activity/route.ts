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

    // Get recent proposals
    const { data: recentProposals } = await supabase
      .from("project_proposals")
      .select(
        `
        id,
        title,
        status,
        created_at,
        proposed_by_user:users!project_proposals_proposed_by_fkey(
          display_name
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    // Get recent projects
    const { data: recentProjects } = await supabase
      .from("projects")
      .select(
        `
        id,
        title,
        status,
        created_at,
        created_by_user:users!projects_created_by_fkey(
          display_name
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    // Get recent users
    const { data: recentUsers } = await supabase
      .from("users")
      .select(
        `
        id,
        display_name,
        role,
        created_at
      `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    // Combine and sort all activities
    const activities = [];

    // Add proposals
    if (recentProposals) {
      recentProposals.forEach((proposal) => {
        activities.push({
          id: `proposal-${proposal.id}`,
          type: "proposal",
          title: `New proposal: ${proposal.title}`,
          user: proposal.proposed_by_user?.display_name || "Unknown",
          timestamp: proposal.created_at,
        });
      });
    }

    // Add projects
    if (recentProjects) {
      recentProjects.forEach((project) => {
        activities.push({
          id: `project-${project.id}`,
          type: "project",
          title: `New project: ${project.title}`,
          user: project.created_by_user?.display_name || "Unknown",
          timestamp: project.created_at,
        });
      });
    }

    // Add users
    if (recentUsers) {
      recentUsers.forEach((user) => {
        activities.push({
          id: `user-${user.id}`,
          type: "user",
          title: `New user registered: ${user.display_name} (${user.role})`,
          user: user.display_name,
          timestamp: user.created_at,
        });
      });
    }

    // Sort by timestamp (most recent first) and take top 10
    const sortedActivities = activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    return NextResponse.json({ data: sortedActivities });
  } catch (error) {
    console.error("Error in GET /api/analytics/recent-activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
