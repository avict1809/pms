import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";
import { supabaseAdmin } from "@/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, display_name } = await request.json();

    if (!email || !password || !display_name) {
      return NextResponse.json(
        { error: "Email, password, and display name are required" },
        { status: 400 }
      );
    }

    // Check if user exists in our database and is active
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("id, email, display_name, role, is_active, is_first_login")
      .eq("email", email)
      .single();

    if (dbError) {
      if (dbError.code === "PGRST116") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Check if user is active
    if (!userData.is_active) {
      return NextResponse.json(
        {
          error: "Account is not activated. Please contact your administrator.",
        },
        { status: 403 }
      );
    }

    // Check if user has already set up their password
    if (!userData.is_first_login) {
      return NextResponse.json(
        { error: "Password has already been set up for this account." },
        { status: 400 }
      );
    }

    // Update the user's password in Supabase Auth using admin API
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(
        userData.id, // Use the database ID (which should match auth ID now)
        {
          password: password,
          user_metadata: {
            display_name: display_name,
            role: userData.role,
          },
          app_metadata: {
            role: userData.role,
          },
        }
      );

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Failed to update user password. Please try again." },
        { status: 500 }
      );
    }

    // Update our database to mark first login as complete
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_first_login: false,
        password_set_at: new Date().toISOString(),
      })
      .eq("id", userData.id);

    if (updateError) {
      console.error("Update error:", updateError);
      // Even if update fails, the auth user was updated, so we should still return success
    }

    return NextResponse.json({
      success: true,
      message: "Password set up successfully. You can now log in.",
      user: {
        id: userData.id,
        email: authData.user?.email || userData.email,
        display_name: display_name,
        role: userData.role,
      },
    });
  } catch (error) {
    console.error("Error in first-time setup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
