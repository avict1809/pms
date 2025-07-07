"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { usePollingQuery } from "@/hooks/usePollingQuery";
import { supabase } from "@/supabase/client";
import RequestCard from "@/components/requests/RequestCard";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-orange-400 font-mono text-md uppercase tracking-widest mb-4">
      {children}
    </h2>
  );
}

const mockRequests = [
  { id: 1, title: "Budget Increase", status: "pending", requestedBy: "Alice" },
  { id: 2, title: "Tool Access", status: "approved", requestedBy: "Bob" },
  {
    id: 3,
    title: "Deadline Extension",
    status: "denied",
    requestedBy: "Carol",
  },
];

export default function ProjectRequestsPage() {
  const { id: projectId } = useParams();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch requests for this project only
  const {
    data: requests,
    loading,
    error,
    refetch,
  } = usePollingQuery(
    async () => {
      const { data, error } = await supabase
        .from("approval_requests")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
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

  // TODO: Add create/edit/delete handlers and modals for CRUD

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-orange-400 font-mono uppercase tracking-widest">
          Project Requests
        </h1>
        <button
          onClick={handleRefresh}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded transition"
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {/* Add create-request button/modal here */}
      {loading ? (
        <div className="text-orange-400">Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error loading requests</div>
      ) : requests && requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((request: any) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="text-neutral-400">No requests yet.</div>
      )}
    </div>
  );
}
