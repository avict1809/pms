import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";
import { supabaseAdmin } from "@/supabase/server";

// GET - Fetch specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
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
    console.error("Error:", error);
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
      .eq("id", projectId)
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

// DELETE - Delete user from both users table and Supabase Auth
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // First, get the user's email from our database
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("email")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching user:", fetchError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Try to delete from Supabase Auth using admin client
    // Only attempt if service role key is available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        id
      );

      if (authError) {
        console.error("Error deleting from auth:", authError);
        // Continue with database deletion even if auth deletion fails
        // (user might not exist in auth if they never logged in)
      }
    } else {
      console.warn(
        "⚠️  SUPABASE_SERVICE_ROLE_KEY not available. Skipping auth deletion."
      );
      console.warn(
        "💡 User will only be deleted from the database, not from Supabase Auth."
      );
    }

    // Delete from our users table
    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Error deleting from database:", dbError);
      return NextResponse.json(
        { error: "Failed to delete user from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: { id, email: userData.email },
      authDeleted: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
