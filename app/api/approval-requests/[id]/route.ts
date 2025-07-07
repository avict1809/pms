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

    // Fetch approval request
    const { data: approvalRequest, error } = await supabase
      .from("approval_requests")
      .select(`
        *,
        requested_by_user:users!approval_requests_requested_by_fkey(
          id,
          display_name,
          email,
          role
        ),
        responded_by_user:users!approval_requests_responded_by_fkey(
          id,
          display_name,
          email,
          role
        ),
        project:projects!approval_requests_project_id_fkey(
          id,
          title
        )
      `)
      .eq("id", projectId)
      .single();

    if (error) {
      return NextResponse.json({ error: "Approval request not found" }, { status: 404 });
    }

    // Check access permissions
    if (userData.role !== "admin") {
      // Check if user is a member of the project
      const { data: projectMember, error: memberError } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", approvalRequest.project_id)
        .eq("user_id", user.id)
        .single();

      if (memberError) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json({ data: approvalRequest });
  } catch (error) {
    console.error("Error in GET /api/approval-requests/[id]:", error);
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

    const { status, admin_comment } = await request.json();

    if (!status || !["pending", "approved", "denied"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'pending', 'approved', or 'denied'" },
        { status: 400 }
      );
    }

    const { data: approvalRequest, error } = await supabase
      .from("approval_requests")
      .update({
        status,
        admin_comment,
        responded_at: new Date().toISOString(),
        responded_by: user.id,
      })
      .eq("id", projectId)
      .select(`
        *,
        requested_by_user:users!approval_requests_requested_by_fkey(
          id,
          display_name,
          email,
          role
        ),
        responded_by_user:users!approval_requests_responded_by_fkey(
          id,
          display_name,
          email,
          role
        ),
        project:projects!approval_requests_project_id_fkey(
          id,
          title
        )
      `)
      .single();

    if (error) {
      console.error("Error updating approval request:", error);
      return NextResponse.json(
        { error: "Failed to update approval request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: approvalRequest });
  } catch (error) {
    console.error("Error in PUT /api/approval-requests/[id]:", error);
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
      .from("approval_requests")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("Error deleting approval request:", error);
      return NextResponse.json(
        { error: "Failed to delete approval request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/approval-requests/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 