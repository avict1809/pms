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

    // Get all proposals with team members and supervisor data
    const { data: proposals, error } = await supabase
      .from("project_proposals")
      .select(
        `
        *,
        proposed_by_user:users!project_proposals_proposed_by_fkey(
          id,
          display_name,
          email,
          role
        ),
        supervisor_data:users!project_proposals_proposed_supervisor_id_fkey(
          id,
          display_name,
          email,
          role
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

    // Get team members data for each proposal
    const proposalsWithTeamMembers = await Promise.all(
      proposals.map(async (proposal) => {
        if (proposal.team_members && proposal.team_members.length > 0) {
          const { data: teamMembersData } = await supabase
            .from("users")
            .select("id, display_name, email, role")
            .in("id", proposal.team_members);

          return {
            ...proposal,
            team_members_data: teamMembersData || [],
          };
        }
        return {
          ...proposal,
          team_members_data: [],
        };
      })
    );

    return NextResponse.json({ data: proposalsWithTeamMembers });
  } catch (error) {
    console.error("Error in GET /api/proposals/all:", error);
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

    const {
      title,
      description,
      objectives,
      methodology,
      expected_outcomes,
      timeline,
      resources,
    } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const { data: proposal, error: insertError } = await supabase
      .from("project_proposals")
      .insert({
        title,
        description,
        objectives: objectives || null,
        methodology: methodology || null,
        expected_outcomes: expected_outcomes || null,
        timeline: timeline || null,
        resources: resources || null,
        status: "pending",
        proposed_by: null, // Anonymous submission
      })
      .select(
        `
        *,
        proposed_by_user:users!project_proposals_proposed_by_fkey(
          id,
          display_name,
          email,
          role
        )
      `
      )
      .single();

    if (insertError) {
      console.error("Error creating proposal:", insertError);
      return NextResponse.json(
        { error: "Failed to create proposal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: proposal }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/proposals/all:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
