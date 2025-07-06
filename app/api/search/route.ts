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
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query}%`;
    const results: any[] = [];

    // Search projects
    const { data: projects } = await supabase
      .from("projects")
      .select(
        `
        id,
        title,
        description,
        status,
        created_at,
        supervisor:users!projects_supervisor_id_fkey(display_name)
      `
      )
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(limit);

    if (projects) {
      results.push(
        ...projects.map((project) => ({
          id: project.id,
          type: "project",
          title: project.title,
          description: project.description,
          url: `/projects/${project.id}`,
          metadata: {
            status: project.status,
            created_at: project.created_at,
            supervisor: project.supervisor?.display_name,
          },
        }))
      );
    }

    // Search tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select(
        `
        id,
        title,
        description,
        status,
        created_at,
        project_id,
        assigned_to:users!tasks_assigned_to_fkey(display_name)
      `
      )
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(limit);

    if (tasks) {
      results.push(
        ...tasks.map((task) => ({
          id: task.id,
          type: "task",
          title: task.title,
          description: task.description,
          url: `/projects/${task.project_id}/tasks/${task.id}`,
          metadata: {
            status: task.status,
            created_at: task.created_at,
            assigned_to: task.assigned_to?.display_name,
          },
        }))
      );
    }

    // Search files
    const { data: files } = await supabase
      .from("files")
      .select(
        `
        id,
        filename,
        file_type,
        file_size,
        uploaded_at,
        project_id,
        uploaded_by:users!files_uploaded_by_fkey(display_name)
      `
      )
      .ilike("filename", searchTerm)
      .limit(limit);

    if (files) {
      results.push(
        ...files.map((file) => ({
          id: file.id,
          type: "file",
          title: file.filename,
          description: `Uploaded by ${file.uploaded_by?.display_name}`,
          url: `/projects/${file.project_id}`,
          metadata: {
            file_type: file.file_type,
            file_size: file.file_size,
            created_at: file.uploaded_at,
          },
        }))
      );
    }

    // Search announcements
    const { data: announcements } = await supabase
      .from("announcements")
      .select(
        `
        id,
        title,
        content,
        target_type,
        created_at,
        posted_by:users!announcements_posted_by_fkey(display_name)
      `
      )
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
      .limit(limit);

    if (announcements) {
      results.push(
        ...announcements.map((announcement) => ({
          id: announcement.id,
          type: "announcement",
          title: announcement.title,
          description: announcement.content,
          url: "/announcements",
          metadata: {
            created_at: announcement.created_at,
            posted_by: announcement.posted_by?.display_name,
          },
        }))
      );
    }

    // Search users (only for admins)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role === "admin") {
        const { data: users } = await supabase
          .from("users")
          .select(
            `
            id,
            display_name,
            email,
            role,
            created_at
          `
          )
          .or(`display_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .limit(limit);

        if (users) {
          results.push(
            ...users.map((user) => ({
              id: user.id,
              type: "user",
              title: user.display_name,
              description: `${user.email} (${user.role})`,
              url: `/admin/users`,
              metadata: {
                created_at: user.created_at,
                role: user.role,
              },
            }))
          );
        }
      }
    }

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === query.toLowerCase();
      const bExact = b.title.toLowerCase() === query.toLowerCase();

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      return (
        new Date(b.metadata?.created_at || 0).getTime() -
        new Date(a.metadata?.created_at || 0).getTime()
      );
    });

    return NextResponse.json({
      results: sortedResults.slice(0, limit),
      total: sortedResults.length,
    });
  } catch (error) {
    console.error("Error in global search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
