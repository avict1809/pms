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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get project statistics
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, status, created_at");

    if (projectsError) {
      return NextResponse.json(
        { error: "Failed to fetch project data" },
        { status: 500 }
      );
    }

    // Get task statistics
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, status, created_at, updated_at, completed_at");

    if (tasksError) {
      return NextResponse.json(
        { error: "Failed to fetch task data" },
        { status: 500 }
      );
    }

    // Get user statistics
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, created_at, last_login");

    if (usersError) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    // Get file statistics
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("id, file_size, project_id");

    if (filesError) {
      return NextResponse.json(
        { error: "Failed to fetch file data" },
        { status: 500 }
      );
    }

    // Calculate project stats
    const projectStats = {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "active").length,
      completedProjects: projects.filter((p) => p.status === "completed")
        .length,
      pendingProjects: projects.filter((p) => p.status === "pending").length,
    };

    // Calculate task stats
    const taskStats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      inProgressTasks: tasks.filter((t) => t.status === "in_progress").length,
      pendingTasks: tasks.filter((t) => t.status === "todo").length,
    };

    // Calculate user stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userStats = {
      totalUsers: users.length,
      activeUsers: users.filter(
        (u) => u.last_login && new Date(u.last_login) > thirtyDaysAgo
      ).length,
      newUsersThisMonth: users.filter(
        (u) => new Date(u.created_at) > thirtyDaysAgo
      ).length,
    };

    // Calculate file stats
    const fileStats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + (file.file_size || 0), 0),
      averageFilesPerProject:
        projectStats.totalProjects > 0
          ? files.length / projectStats.totalProjects
          : 0,
    };

    // Calculate performance metrics
    const completedTasks = tasks.filter(
      (t) => t.status === "completed" && t.completed_at
    );
    const averageTaskCompletionTime =
      completedTasks.length > 0
        ? completedTasks.reduce((sum, task) => {
            const created = new Date(task.created_at);
            const completed = new Date(task.completed_at);
            return (
              sum + (completed.getTime() - created.getTime()) / (1000 * 60 * 60)
            ); // hours
          }, 0) / completedTasks.length
        : 0;

    const projectSuccessRate =
      projectStats.totalProjects > 0
        ? (projectStats.completedProjects / projectStats.totalProjects) * 100
        : 0;

    const userEngagementRate =
      userStats.totalUsers > 0
        ? (userStats.activeUsers / userStats.totalUsers) * 100
        : 0;

    // Generate timeline data (last 6 months)
    const timelineData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthProjects = projects.filter((p) => {
        const created = new Date(p.created_at);
        return created >= monthStart && created <= monthEnd;
      }).length;

      const monthTasks = tasks.filter((t) => {
        const created = new Date(t.created_at);
        return created >= monthStart && created <= monthEnd;
      }).length;

      const monthUsers = users.filter((u) => {
        const created = new Date(u.created_at);
        return created >= monthStart && created <= monthEnd;
      }).length;

      timelineData.push({
        month: monthKey,
        projects: monthProjects,
        tasks: monthTasks,
        users: monthUsers,
      });
    }

    const analyticsData = {
      projectStats,
      taskStats,
      userStats,
      fileStats,
      timelineData,
      performanceMetrics: {
        averageTaskCompletionTime,
        projectSuccessRate,
        userEngagementRate,
      },
    };

    return NextResponse.json({ data: analyticsData });
  } catch (error) {
    console.error("Error in system analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
