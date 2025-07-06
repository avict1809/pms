"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Calendar,
  Users,
  FolderOpen,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

interface ProjectFinance {
  id: string;
  title: string;
  total_income: number;
  total_expenses: number;
  balance: number;
  record_count: number;
}

interface SystemFinance {
  total_income: number;
  total_expenses: number;
  total_balance: number;
  project_count: number;
  record_count: number;
}

export default function AdminFinancePage() {
  const [systemFinance, setSystemFinance] = useState<SystemFinance | null>(
    null
  );
  const [projectFinances, setProjectFinances] = useState<ProjectFinance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      // Fetch system-wide financial data
      const systemResponse = await fetch("/api/admin/finance/system");
      const systemData = await systemResponse.json();

      if (systemData.error) {
        setError(systemData.error);
      } else {
        setSystemFinance(systemData.data);
      }

      // Fetch project-wise financial data
      const projectsResponse = await fetch("/api/admin/finance/projects");
      const projectsData = await projectsResponse.json();

      if (projectsData.error) {
        setError(projectsData.error);
      } else {
        setProjectFinances(projectsData.data || []);
      }
    } catch (err) {
      setError("Failed to fetch financial data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
              <p className="text-neutral-400 mt-2">Loading financial data...</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-[#23232a] border-red-500 shadow-lg">
            <CardContent className="p-8 text-center">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            System Finance Dashboard
          </h1>
          <p className="text-neutral-400">
            Overview of all project finances across the system
          </p>
        </div>

        {/* System Overview Cards */}
        {systemFinance && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-[#23232a] border-cyan-500 shadow-lg">
              <CardContent className="p-6 flex items-center gap-4">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="text-cyan-400 text-lg font-bold">
                    ${systemFinance.total_income.toLocaleString()}
                  </div>
                  <div className="text-neutral-400 text-sm">Total Income</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#23232a] border-orange-500 shadow-lg">
              <CardContent className="p-6 flex items-center gap-4">
                <TrendingDown className="w-8 h-8 text-orange-400" />
                <div>
                  <div className="text-orange-400 text-lg font-bold">
                    ${systemFinance.total_expenses.toLocaleString()}
                  </div>
                  <div className="text-neutral-400 text-sm">Total Expenses</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#23232a] border-green-500 shadow-lg">
              <CardContent className="p-6 flex items-center gap-4">
                <DollarSign className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-green-400 text-lg font-bold">
                    ${systemFinance.total_balance.toLocaleString()}
                  </div>
                  <div className="text-neutral-400 text-sm">Net Balance</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#23232a] border-blue-500 shadow-lg">
              <CardContent className="p-6 flex items-center gap-4">
                <FolderOpen className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-blue-400 text-lg font-bold">
                    {systemFinance.project_count}
                  </div>
                  <div className="text-neutral-400 text-sm">
                    Active Projects
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#23232a] border-purple-500 shadow-lg">
              <CardContent className="p-6 flex items-center gap-4">
                <BarChart3 className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-purple-400 text-lg font-bold">
                    {systemFinance.record_count}
                  </div>
                  <div className="text-neutral-400 text-sm">Total Records</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Project Finance Table */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Project Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectFinances.length === 0 ? (
              <div className="text-neutral-400 text-center py-8">
                No financial data available for projects.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left py-3 px-4 text-neutral-300 font-medium">
                        Project
                      </th>
                      <th className="text-right py-3 px-4 text-neutral-300 font-medium">
                        Income
                      </th>
                      <th className="text-right py-3 px-4 text-neutral-300 font-medium">
                        Expenses
                      </th>
                      <th className="text-right py-3 px-4 text-neutral-300 font-medium">
                        Balance
                      </th>
                      <th className="text-right py-3 px-4 text-neutral-300 font-medium">
                        Records
                      </th>
                      <th className="text-center py-3 px-4 text-neutral-300 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectFinances.map((project) => (
                      <tr
                        key={project.id}
                        className="border-b border-neutral-800 hover:bg-neutral-800/50"
                      >
                        <td className="py-3 px-4 text-white font-medium">
                          {project.title}
                        </td>
                        <td className="py-3 px-4 text-right text-cyan-400">
                          ${project.total_income.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-orange-400">
                          ${project.total_expenses.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={
                              project.balance >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            ${project.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-400">
                          {project.record_count}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant="outline"
                            className={
                              project.balance >= 0
                                ? "border-green-500 text-green-400"
                                : "border-red-500 text-red-400"
                            }
                          >
                            {project.balance >= 0 ? "Profitable" : "Deficit"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
