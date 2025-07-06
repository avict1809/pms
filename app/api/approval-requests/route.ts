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

    // Get all approval requests
    const { data: requests, error } = await supabase
      .from("approval_requests")
      .select(
        `
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
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching approval requests:", error);
      return NextResponse.json(
        { error: "Failed to fetch approval requests" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: requests });
  } catch (error) {
    console.error("Error in GET /api/approval-requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { project_id, request_type, title, description } =
      await request.json();

    if (!project_id || !request_type || !title) {
      return NextResponse.json(
        { error: "Project ID, request type, and title are required" },
        { status: 400 }
      );
    }

    if (
      !["tool", "document", "budget", "timeline", "other"].includes(
        request_type
      )
    ) {
      return NextResponse.json(
        { error: "Invalid request type" },
        { status: 400 }
      );
    }

    // Check if project exists
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data: approvalRequest, error: insertError } = await supabase
      .from("approval_requests")
      .insert({
        project_id,
        request_type,
        title,
        description,
        requested_by: null, // Anonymous request
      })
      .select(
        `
        *,
        requested_by_user:users!approval_requests_requested_by_fkey(
          id,
          display_name,
          email,
          role
        ),
        project:projects!approval_requests_project_id_fkey(
          id,
          title
        )
      `
      )
      .single();

    if (insertError) {
      console.error("Error creating approval request:", insertError);
      return NextResponse.json(
        { error: "Failed to create approval request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: approvalRequest });
  } catch (error) {
    console.error("Error in POST /api/approval-requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
