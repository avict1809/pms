import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Error in users API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, display_name, role, is_active = false } = body;

    // Validate required fields
    if (!email || !display_name || !role) {
      return NextResponse.json(
        { error: "Email, display name, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["admin", "supervisor", "student"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin, supervisor, or student" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          display_name,
          role,
          is_active,
          is_first_login: true,
          password_hash: null, // Will be set on first login
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error in user creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
