"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FinanceOverview from "@/components/projects/finance/FinanceOverview";
import ExpenseList from "@/components/projects/finance/ExpenseList";
import IncomeList from "@/components/projects/finance/IncomeList";
import AddRecordForm from "@/components/projects/finance/AddRecordForm";
import FinancialChart from "@/components/projects/finance/FinancialChart";

export default function ProjectFinancePage() {
  const params = useParams();
  const projectId = params.id as string;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [projectId]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/finance`);
      const data = await response.json();
      if (data.error) setError(data.error);
      else setRecords(data.data || []);
    } catch (err) {
      setError("Failed to fetch financial records");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#23232a] border-orange-500 shadow-lg mt-8">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-neutral-400 mt-2">Loading financial records...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#23232a] border-red-500 shadow-lg mt-8">
        <CardContent className="p-8 text-center">
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Project Finance</h1>
        <AddRecordForm projectId={projectId} onRecordAdded={fetchRecords} />
      </div>

      <FinanceOverview records={records} />

      <FinancialChart records={records} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ExpenseList
          records={records.filter((r: any) => r.type === "expense")}
        />
        <IncomeList records={records.filter((r: any) => r.type === "income")} />
      </div>
    </div>
  );
}
