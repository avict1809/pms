import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, comment } = await request.json();

    // Get the current user (admin)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request to review
    const { data: requestData, error: fetchError } = await supabase
      .from("approval_requests")
      .select("*")
      .eq("id", projectId)
      .single();

    if (fetchError || !requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Update the request with the review decision
    const updateData = {
      status: action === "approve" ? "approved" : "denied",
      responded_by: user.id,
      responded_at: new Date().toISOString(),
      admin_comment: comment || null,
    };

    const { error: updateError } = await supabase
      .from("approval_requests")
      .update(updateData)
      .eq("id", projectId);

    if (updateError) {
      console.error("Error updating request:", updateError);
      return NextResponse.json(
        { error: "Failed to update request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Request ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error in request review API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
