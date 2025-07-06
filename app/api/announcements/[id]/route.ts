import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Get user role
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch announcement
    const { data: announcement, error } = await supabase
      .from("announcements")
      .select(
        `
        *,
        posted_by_user:users!announcements_posted_by_fkey(
          id,
          display_name,
          email,
          role
        )
      `
      )
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    if (userData.role !== "admin") {
      // Non-admins can only see announcements they should see
      const hasAccess =
        announcement.target_type === "global" ||
        announcement.target_type === userData.role ||
        (announcement.target_type === "project" &&
          // TODO: Check if user is member of this project
          true) ||
        announcement.target_id === user.id;

      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json({ data: announcement });
  } catch (error) {
    console.error("Error in GET /api/announcements/[id]:", error);
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
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || userData?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { title, content, target_type, target_id } = await request.json();

    if (!title || !content || !target_type) {
      return NextResponse.json(
        { error: "Title, content, and target_type are required" },
        { status: 400 }
      );
    }

    if (!["global", "project", "student", "supervisor"].includes(target_type)) {
      return NextResponse.json(
        { error: "Invalid target_type" },
        { status: 400 }
      );
    }

    // Validate target_id if provided
    if (target_id) {
      if (target_type === "project") {
        const { data: project } = await supabase
          .from("projects")
          .select("id")
          .eq("id", target_id)
          .single();
        if (!project) {
          return NextResponse.json(
            { error: "Invalid project ID" },
            { status: 400 }
          );
        }
      } else if (["student", "supervisor"].includes(target_type)) {
        const { data: targetUser } = await supabase
          .from("users")
          .select("id, role")
          .eq("id", target_id)
          .single();
        if (!targetUser || targetUser.role !== target_type) {
          return NextResponse.json(
            { error: `Invalid ${target_type} ID` },
            { status: 400 }
          );
        }
      }
    }

    const { data: announcement, error } = await supabase
      .from("announcements")
      .update({
        title,
        content,
        target_type,
        target_id: target_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select(
        `
        *,
        posted_by_user:users!announcements_posted_by_fkey(
          id,
          display_name,
          email,
          role
        )
      `
      )
      .single();

    if (error) {
      console.error("Error updating announcement:", error);
      return NextResponse.json(
        { error: "Failed to update announcement" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: announcement });
  } catch (error) {
    console.error("Error in PUT /api/announcements/[id]:", error);
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
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || userData?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting announcement:", error);
      return NextResponse.json(
        { error: "Failed to delete announcement" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/announcements/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
