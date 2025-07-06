import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

export async function GET(request: NextRequest) {
  try {
    // Get all requests with user and project information
    const { data: requests, error } = await supabase
      .from("approval_requests")
      .select(
        `
        *,
        requested_by:users!approval_requests_requested_by_fkey(
          id,
          display_name,
          email,
          role
        ),
        responded_by:users!approval_requests_responded_by_fkey(
          id,
          display_name,
          email
        ),
        project:projects(
          id,
          title
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
      return NextResponse.json(
        { error: "Failed to fetch requests" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: requests });
  } catch (error) {
    console.error("Error in requests API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
