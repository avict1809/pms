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

    // Get system-wide financial summary
    const { data: financialRecords, error: recordsError } = await supabase
      .from("financial_records")
      .select("amount, type");

    if (recordsError) {
      return NextResponse.json(
        { error: "Failed to fetch financial records" },
        { status: 500 }
      );
    }

    // Calculate totals
    const totalIncome = financialRecords
      .filter((record) => record.type === "income")
      .reduce((sum, record) => sum + Number(record.amount), 0);

    const totalExpenses = financialRecords
      .filter((record) => record.type === "expense")
      .reduce((sum, record) => sum + Number(record.amount), 0);

    const balance = totalIncome - totalExpenses;

    // Get project count
    const { count: projectCount, error: projectError } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });

    if (projectError) {
      return NextResponse.json(
        { error: "Failed to fetch project count" },
        { status: 500 }
      );
    }

    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (userError) {
      return NextResponse.json(
        { error: "Failed to fetch user count" },
        { status: 500 }
      );
    }

    const systemStats = {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      balance: balance,
      project_count: projectCount || 0,
      user_count: userCount || 0,
      record_count: financialRecords.length,
    };

    return NextResponse.json({ data: systemStats });
  } catch (error) {
    console.error("Error in GET /api/admin/finance/system:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
