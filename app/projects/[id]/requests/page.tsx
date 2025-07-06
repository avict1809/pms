"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  RefreshCw,
  Send,
  Calendar,
  User,
  FolderOpen,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import RequestCard from "@/components/requests/RequestCard";
import RequestForm from "@/components/requests/RequestForm";
import { useAuth } from "@/hooks/useAuthRedirect";

interface ApprovalRequest {
  id: string;
  project_id: string;
  request_type: "tool" | "document" | "budget" | "timeline" | "other";
  title: string;
  description?: string;
  status: "pending" | "approved" | "denied";
  admin_comment?: string;
  created_at: string;
  responded_at?: string;
  requested_by: string;
  responded_by?: string;
  requested_by_user: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
  responded_by_user?: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
  project: {
    id: string;
    title: string;
  };
}

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
}

export default function ProjectRequestsPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "denied"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchRequests();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      const data = await response.json();

      if (data.error) {
        setError("Failed to fetch project");
      } else {
        setProject(data.data);
      }
    } catch (err) {
      setError("Failed to fetch project");
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/approval-requests");
      const data = await response.json();

      if (data.error) {
        setError("Failed to fetch requests");
      } else {
        // Filter requests for this project
        const projectRequests = (data.data || []).filter(
          (req: ApprovalRequest) => req.project_id === params.id
        );
        setRequests(projectRequests);
      }
    } catch (err) {
      setError("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (formData: {
    project_id: string;
    request_type: "tool" | "document" | "budget" | "timeline" | "other";
    title: string;
    description: string;
  }) => {
    try {
      setCreateLoading(true);
      const response = await fetch("/api/approval-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.error) {
        setError("Failed to create request");
      } else {
        setRequests((prev) => [data.data, ...prev]);
        setShowCreateForm(false);
      }
    } catch (err) {
      setError("Failed to create request");
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 text-yellow-400";
      case "approved":
        return "border-green-500 text-green-400";
      case "denied":
        return "border-red-500 text-red-400";
      default:
        return "border-neutral-500 text-neutral-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "denied":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesFilter = filter === "all" || request.status === filter;
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requested_by_user.display_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    denied: requests.filter((r) => r.status === "denied").length,
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center py-8">
          <div className="text-orange-400 text-lg">Loading requests...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Approval Requests
              </h1>
              {project && (
                <p className="text-neutral-400">
                  Manage approval requests for{" "}
                  <span className="text-orange-400">{project.title}</span>
                </p>
              )}
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats.total}
                  </div>
                  <div className="text-sm text-neutral-400">Total Requests</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-yellow-500 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats.pending}
                  </div>
                  <div className="text-sm text-neutral-400">Pending</div>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-green-500 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats.approved}
                  </div>
                  <div className="text-sm text-neutral-400">Approved</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-red-500 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats.denied}
                  </div>
                  <div className="text-sm text-neutral-400">Denied</div>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className={
                    filter === "all"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "border-neutral-600 text-neutral-300"
                  }
                >
                  All
                </Button>
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  onClick={() => setFilter("pending")}
                  className={
                    filter === "pending"
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "border-neutral-600 text-neutral-300"
                  }
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Pending
                </Button>
                <Button
                  variant={filter === "approved" ? "default" : "outline"}
                  onClick={() => setFilter("approved")}
                  className={
                    filter === "approved"
                      ? "bg-green-500 hover:bg-green-600"
                      : "border-neutral-600 text-neutral-300"
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approved
                </Button>
                <Button
                  variant={filter === "denied" ? "default" : "outline"}
                  onClick={() => setFilter("denied")}
                  className={
                    filter === "denied"
                      ? "bg-red-500 hover:bg-red-600"
                      : "border-neutral-600 text-neutral-300"
                  }
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Denied
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={fetchRequests}
                className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-900/20 border-red-500 shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="text-red-400">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Create Request Form */}
        {showCreateForm && (
          <Card className="bg-[#23232a] border-orange-500 shadow-lg mb-6">
            <CardContent className="p-6">
              <RequestForm
                onSubmit={handleCreateRequest}
                onCancel={() => setShowCreateForm(false)}
                loading={createLoading}
              />
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card className="bg-[#23232a] border-orange-500 shadow-lg">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No requests found
                </h3>
                <p className="text-neutral-400">
                  {searchTerm || filter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No approval requests have been submitted for this project yet"}
                </p>
                {!showCreateForm && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Create First Request
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                showActions={false}
              />
            ))
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
