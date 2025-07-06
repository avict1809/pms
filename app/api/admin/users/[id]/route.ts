import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

// GET - Fetch specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      console.error("Error fetching user:", error);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Error in user fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { display_name, role, is_active, is_first_login } = body;

    // Validate role if provided
    if (role && !["admin", "supervisor", "student"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin, supervisor, or student" },
        { status: 400 }
      );
    }

    // Update user
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        ...(display_name && { display_name }),
        ...(role && { role }),
        ...(typeof is_active === "boolean" && { is_active }),
        ...(typeof is_first_login === "boolean" && { is_first_login }),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error("Error in user update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", params.id)
      .single();

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user
    const { error } = await supabase.from("users").delete().eq("id", params.id);

    if (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in user deletion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
