import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../supabase/client";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get user role
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (roleError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build query based on user role
    let query = supabase
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
      .order("created_at", { ascending: false });

    // If admin, get all announcements
    if (userData.role === "admin") {
      // No additional filters needed
    } else {
      // For non-admins, get announcements they should see
      query = query.or(
        `target_type.eq.global,target_type.eq.${userData.role},target_id.eq.${userId}`
      );
    }

    const { data: announcements, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching announcements:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch announcements" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: announcements });
  } catch (err) {
    console.error("Error in GET /api/announcements:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, target_type, target_id, userId } =
      await request.json();

    if (!title || !content || !target_type || !userId) {
      return NextResponse.json(
        { error: "Title, content, target_type, and userId are required" },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (roleError || userData?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
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

    const { data: announcement, error: insertError } = await supabase
      .from("announcements")
      .insert({
        title,
        content,
        target_type,
        target_id: target_id || null,
        posted_by: userId,
      })
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

    if (insertError) {
      console.error("Error creating announcement:", insertError);
      return NextResponse.json(
        { error: "Failed to create announcement" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/announcements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
