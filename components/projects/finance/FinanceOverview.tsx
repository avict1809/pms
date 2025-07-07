import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function FinanceOverview({ records }: { records: any[] }) {
  const totalIncome = records
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const totalExpense = records
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-[#23232a] border-cyan-500 shadow-lg">
        <CardContent className="p-6 flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-cyan-400" />
          <div>
            <div className="text-cyan-400 text-lg font-bold">
              ${totalIncome.toLocaleString()}
            </div>
            <div className="text-neutral-400 text-md">Total Income</div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardContent className="p-6 flex items-center gap-4">
          <TrendingDown className="w-8 h-8 text-orange-400" />
          <div>
            <div className="text-orange-400 text-lg font-bold">
              ${totalExpense.toLocaleString()}
            </div>
            <div className="text-neutral-400 text-md">Total Expenses</div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[#23232a] border-green-500 shadow-lg">
        <CardContent className="p-6 flex items-center gap-4">
          <DollarSign className="w-8 h-8 text-green-400" />
          <div>
            <div className="text-green-400 text-lg font-bold">
              ${balance.toLocaleString()}
            </div>
            <div className="text-neutral-400 text-md">Balance</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
