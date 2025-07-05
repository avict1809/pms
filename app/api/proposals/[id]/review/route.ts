import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../../supabase/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, comment } = await request.json();
    const proposalId = params.id;

    if (!status || !["approved", "denied"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'denied'" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("project_proposals")
      .update({
        status,
        admin_comment: comment,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposalId);

    if (error) {
      console.error("Error updating proposal:", error);
      return NextResponse.json(
        { error: "Failed to update proposal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in proposal review API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
