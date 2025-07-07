"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

interface FinancialChartProps {
  records: any[];
}

export default function FinancialChart({ records }: FinancialChartProps) {
  // Group records by month
  const monthlyData = records.reduce((acc: any, record) => {
    const date = new Date(record.date || record.created_at);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expenses: 0 };
    }

    if (record.type === "income") {
      acc[monthKey].income += Number(record.amount);
    } else {
      acc[monthKey].expenses += Number(record.amount);
    }

    return acc;
  }, {});

  const months = Object.keys(monthlyData).sort();
  const maxAmount = Math.max(
    ...Object.values(monthlyData).map((data: any) =>
      Math.max(data.income, data.expenses)
    )
  );

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
      "en-US",
      {
        month: "short",
        year: "numeric",
      }
    );
  };

  if (months.length === 0) {
    return (
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Financial Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-neutral-400 text-center py-8">
            No financial data available for charting.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#23232a] border-orange-500 shadow-lg">
      <CardHeader>
        <CardTitle className="text-orange-400 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Financial Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-400 rounded"></div>
              <span className="text-neutral-300">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span className="text-neutral-300">Expenses</span>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-3">
            {months.map((monthKey) => {
              const data = monthlyData[monthKey];
              const incomeHeight =
                maxAmount > 0 ? (data.income / maxAmount) * 100 : 0;
              const expenseHeight =
                maxAmount > 0 ? (data.expenses / maxAmount) * 100 : 0;

              return (
                <div key={monthKey} className="flex items-end gap-2">
                  <div className="flex-1 text-sm text-neutral-400 min-w-[60px]">
                    {formatMonth(monthKey)}
                  </div>
                  <div className="flex-1 flex gap-1 h-20">
                    <div className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-cyan-400 rounded-t transition-all duration-300 hover:bg-cyan-300"
                        style={{ height: `${incomeHeight}%` }}
                        title={`Income: $${data.income.toLocaleString()}`}
                      ></div>
                      <div className="text-sm text-cyan-400 mt-1">
                        ${data.income.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-orange-400 rounded-t transition-all duration-300 hover:bg-orange-300"
                        style={{ height: `${expenseHeight}%` }}
                        title={`Expenses: $${data.expenses.toLocaleString()}`}
                      ></div>
                      <div className="text-sm text-orange-400 mt-1">
                        ${data.expenses.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-700">
            <div className="text-center">
              <div className="text-cyan-400 font-bold">
                $
                {records
                  .filter((r) => r.type === "income")
                  .reduce((sum, r) => sum + Number(r.amount), 0)
                  .toLocaleString()}
              </div>
              <div className="text-neutral-400 text-md">Total Income</div>
            </div>
            <div className="text-center">
              <div className="text-orange-400 font-bold">
                $
                {records
                  .filter((r) => r.type === "expense")
                  .reduce((sum, r) => sum + Number(r.amount), 0)
                  .toLocaleString()}
              </div>
              <div className="text-neutral-400 text-md">Total Expenses</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
