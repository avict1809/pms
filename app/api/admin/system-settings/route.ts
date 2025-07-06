import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

// GET - Fetch all system settings
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("category", { ascending: true })
      .order("setting_key", { ascending: true });

    if (error) {
      console.error("Error fetching system settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch system settings" },
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

// POST - Create or update system setting
export async function POST(request: NextRequest) {
  try {
    const {
      setting_key,
      setting_value,
      setting_type,
      description,
      category,
      is_public,
    } = await request.json();

    if (!setting_key) {
      return NextResponse.json(
        { error: "Setting key is required" },
        { status: 400 }
      );
    }

    // Check if setting exists
    const { data: existingSetting } = await supabase
      .from("system_settings")
      .select("id")
      .eq("setting_key", setting_key)
      .single();

    if (existingSetting) {
      // Update existing setting
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
        .eq("setting_key", setting_key)
        .select()
        .single();

      if (error) {
        console.error("Error updating system setting:", error);
        return NextResponse.json(
          { error: "Failed to update system setting" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        data,
        message: "Setting updated successfully",
      });
    } else {
      // Create new setting
      const { data, error } = await supabase
        .from("system_settings")
        .insert({
          setting_key,
          setting_value,
          setting_type,
          description,
          category,
          is_public,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating system setting:", error);
        return NextResponse.json(
          { error: "Failed to create system setting" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        data,
        message: "Setting created successfully",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
