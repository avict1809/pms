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

    // Get all projects with their financial records
    const { data: projects, error: projectsError } = await supabase.from(
      "projects"
    ).select(`
        id,
        title,
        financial_records (
          amount,
          type
        )
      `);

    if (projectsError) {
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    // Calculate financial summary for each project
    const projectFinances = projects.map((project) => {
      const records = project.financial_records || [];
      const totalIncome = records
        .filter((r: any) => r.type === "income")
        .reduce((sum: number, r: any) => sum + Number(r.amount), 0);

      const totalExpenses = records
        .filter((r: any) => r.type === "expense")
        .reduce((sum: number, r: any) => sum + Number(r.amount), 0);

      const balance = totalIncome - totalExpenses;

      return {
        id: project.id,
        title: project.title,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        balance: balance,
        record_count: records.length,
      };
    });

    return NextResponse.json({ data: projectFinances });
  } catch (error) {
    console.error("Error in GET /api/admin/finance/projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
