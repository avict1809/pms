import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

// GET - Fetch specific system setting by key
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;

    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("setting_key", key)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Setting not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching system setting:", error);
      return NextResponse.json(
        { error: "Failed to fetch system setting" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update specific system setting by key
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    const { setting_value, setting_type, description, category, is_public } =
      await request.json();

    const { data, error } = await supabase
      .from("system_settings")
      .update({
        setting_value,
        setting_type,
        description,
        category,
        is_public,
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", key)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Setting not found" },
          { status: 404 }
        );
      }
      console.error("Error updating system setting:", error);
      return NextResponse.json(
        { error: "Failed to update system setting" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, message: "Setting updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific system setting by key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;

    const { error } = await supabase
      .from("system_settings")
      .delete()
      .eq("setting_key", key);

    if (error) {
      console.error("Error deleting system setting:", error);
      return NextResponse.json(
        { error: "Failed to delete system setting" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Setting deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
