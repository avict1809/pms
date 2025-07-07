"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { usePollingQuery } from "@/hooks/usePollingQuery";
import { supabase } from "@/supabase/client";
import FinancialChart from "@/components/projects/finance/FinancialChart";
import ExpenseList from "@/components/projects/finance/ExpenseList";
import IncomeList from "@/components/projects/finance/IncomeList";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-orange-400 font-mono text-md uppercase tracking-widest mb-4">
      {children}
    </h2>
  );
}

const mockRecords = [
  {
    id: 1,
    type: "income",
    amount: 1000,
    category: "Grant",
    date: "2025-06-01",
  },
  {
    id: 2,
    type: "expense",
    amount: 200,
    category: "Equipment",
    date: "2025-06-05",
  },
  {
    id: 3,
    type: "expense",
    amount: 150,
    category: "Software",
    date: "2025-06-10",
  },
];

export default function ProjectFinancePage() {
  const { id: projectId } = useParams();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch financial records for this project
  const {
    data: records,
    loading,
    error,
    refetch,
  } = usePollingQuery(
    async () => {
      const { data, error } = await supabase
        .from("financial_records")
        .select("*")
        .eq("project_id", projectId)
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
    [projectId],
    5000
  );

  async function handleRefresh() {
    setRefreshing(true);
    refetch && (await refetch());
    setRefreshing(false);
  }

  // TODO: Add add/edit/delete handlers and modals for CRUD

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-orange-400 font-mono uppercase tracking-widest">
          Project Finance
        </h1>
        <button
          onClick={handleRefresh}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded transition"
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {/* Add add-record button/modal here */}
      <FinancialChart records={records || []} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IncomeList records={records || []} />
        <ExpenseList records={records || []} />
      </div>
      {loading && <div className="text-orange-400">Loading...</div>}
      {error && <div className="text-red-500">Error loading records</div>}
    </div>
  );
}
