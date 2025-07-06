import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const projectId = params.id;

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of the project
    const { data: projectMember, error: memberError } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();
    if (memberError) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch financial records for the project with user info
    const { data: records, error: recordsError } = await supabase
      .from("financial_records")
      .select(
        `
        id,
        amount,
        description,
        type,
        category,
        recorded_by,
        created_at,
        date,
        users!financial_records_recorded_by_fkey (
          id,
          display_name,
          email
        )
      `
      )
      .eq("project_id", projectId)
      .order("date", { ascending: false });

    if (recordsError) {
      return NextResponse.json(
        { error: "Failed to fetch records" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: records });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]/finance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const projectId = params.id;
    const body = await request.json();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of the project
    const { data: projectMember, error: memberError } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();
    if (memberError) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate required fields
    if (
      !body.amount ||
      !body.type ||
      !["income", "expense"].includes(body.type)
    ) {
      return NextResponse.json(
        { error: "Amount and type are required" },
        { status: 400 }
      );
    }

    // Insert financial record
    const { data: record, error: insertError } = await supabase
      .from("financial_records")
      .insert({
        project_id: projectId,
        amount: body.amount,
        description: body.description || "",
        type: body.type,
        category: body.category || null,
        recorded_by: user.id,
        date: body.date || null,
      })
      .select(
        `
        id,
        amount,
        description,
        type,
        category,
        recorded_by,
        created_at,
        date,
        users!financial_records_recorded_by_fkey (
          id,
          display_name,
          email
        )
      `
      )
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to add record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/projects/[id]/finance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
