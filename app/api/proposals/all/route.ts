import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../supabase/client";

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("project_proposals")
      .select(
        `
        id,
        title,
        description,
        objectives,
        methodology,
        expected_outcomes,
        timeline,
        resources,
        status,
        created_at,
        updated_at,
        admin_comment,
        reviewed_by,
        reviewed_at,
        proposed_by,
        user:users!project_proposals_proposed_by_fkey(
          display_name,
          email
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching proposals:", error);
      return NextResponse.json(
        { error: "Failed to fetch proposals" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in all-proposals API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
