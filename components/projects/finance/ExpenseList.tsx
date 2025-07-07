import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, User, Calendar } from "lucide-react";

export default function ExpenseList({ records }: { records: any[] }) {
  return (
    <Card className="bg-[#23232a] border-orange-500 shadow-lg">
      <CardHeader>
        <CardTitle className="text-orange-400 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" /> Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-neutral-400 text-center py-8">
            No expenses recorded.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {records.map((r) => (
              <li key={r.id} className="py-4 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 font-bold">
                    -${Number(r.amount).toLocaleString()}
                  </span>
                  <span className="text-neutral-300">{r.description}</span>
                  {r.category && (
                    <span className="ml-2 text-sm bg-orange-900/40 text-orange-300 px-2 py-0.5 rounded">
                      {r.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(r.date || r.created_at).toLocaleDateString()}
                  </span>
                  <User className="w-3 h-3 ml-4" />
                  <span>{r.users?.display_name || "Unknown"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
