import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

export async function GET(request: NextRequest) {
  try {
    // supabase client is already imported

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || userData?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get system-wide financial summary
    const { data: records, error: recordsError } = await supabase
      .from("financial_records")
      .select("amount, type");

    if (recordsError) {
      return NextResponse.json(
        { error: "Failed to fetch financial data" },
        { status: 500 }
      );
    }

    // Calculate totals
    const totalIncome = records
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const totalExpenses = records
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const totalBalance = totalIncome - totalExpenses;

    // Get project count
    const { count: projectCount, error: projectError } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });

    if (projectError) {
      return NextResponse.json(
        { error: "Failed to fetch project data" },
        { status: 500 }
      );
    }

    const systemFinance = {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      total_balance: totalBalance,
      project_count: projectCount || 0,
      record_count: records.length,
    };

    return NextResponse.json({ data: systemFinance });
  } catch (error) {
    console.error("Error in GET /api/admin/finance/system:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
