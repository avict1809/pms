import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const projectId = params.id;

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

    const projectId = params.id;
    const body = await request.json();

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
        recorded_by: null, // Anonymous record
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
