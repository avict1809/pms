import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists in our database
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("id, email, display_name, role, is_active, is_first_login")
      .eq("email", email)
      .single();

    if (dbError) {
      if (dbError.code === "PGRST116") {
        // User doesn't exist in our database
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

    // If user exists and is active, return user data
    // The client will handle checking if they can log in with password
    return NextResponse.json({
      user: userData,
      message: "User found",
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
