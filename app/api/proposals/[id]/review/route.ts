import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../../supabase/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status, comment } = await request.json();
    const { id: proposalId } = await params;

    if (!status || !["approved", "denied"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'denied'" },
        { status: 400 }
      );
    }

    // First, get the proposal details
    const { data: proposal, error: fetchError } = await supabase
      .from("project_proposals")
      .select("*")
      .eq("id", proposalId)
      .single();

    if (fetchError || !proposal) {
      console.error("Error fetching proposal:", fetchError);
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Update the proposal status
    const { error: updateError } = await supabase
      .from("project_proposals")
      .update({
        status,
        admin_comment: comment,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposalId);

    if (updateError) {
      console.error("Error updating proposal:", updateError);
      return NextResponse.json(
        { error: "Failed to update proposal" },
        { status: 500 }
      );
    }

    // If approved, create a new project
    if (status === "approved") {
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: proposal.title,
          description: proposal.description,
          status: "active",
          created_by: proposal.proposed_by,
          supervisor_id: proposal.proposed_supervisor_id,
          proposal_id: proposalId,
        })
        .select()
        .single();

      if (projectError) {
        console.error("Error creating project:", projectError);
        return NextResponse.json(
          { error: "Failed to create project from approved proposal" },
          { status: 500 }
        );
      }

      // Add the project creator as a project member
      if (proposal.proposed_by) {
        const { error: creatorError } = await supabase
          .from("project_members")
          .insert({
            project_id: newProject.id,
            user_id: proposal.proposed_by,
            role: "member",
          });

        if (creatorError) {
          console.error(
            "Error adding project creator to members:",
            creatorError
          );
        }
      }

      // Add team members from proposal_team_members table
      if (proposal.team_members && proposal.team_members.length > 0) {
        const teamMemberInserts = proposal.team_members.map(
          (memberId: string) => ({
            project_id: newProject.id,
            user_id: memberId,
            role: "member",
          })
        );

        const { error: teamError } = await supabase
          .from("project_members")
          .insert(teamMemberInserts);

        if (teamError) {
          console.error("Error creating project team members:", teamError);
          // Don't fail the whole operation, just log the error
        }
      }

      // Add supervisor as project member if specified
      if (proposal.proposed_supervisor_id) {
        const { error: supervisorError } = await supabase
          .from("project_members")
          .insert({
            project_id: newProject.id,
            user_id: proposal.proposed_supervisor_id,
            role: "supervisor",
          });

        if (supervisorError) {
          console.error(
            "Error adding supervisor to project members:",
            supervisorError
          );
        }
      }
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
