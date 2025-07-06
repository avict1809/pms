import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get all projects with their financial records
    const { createServerClient } = await import("@supabase/ssr");
    const { cookies } = await import("next/headers");
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
        .filter((r) => r.type === "income")
        .reduce((sum, r) => sum + Number(r.amount), 0);
      const totalExpenses = records
        .filter((r) => r.type === "expense")
        .reduce((sum, r) => sum + Number(r.amount), 0);
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
