"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabase } from "@/supabase/context";

const REQUEST_TYPES = [
  { value: "tool", label: "Tool" },
  { value: "document", label: "Document" },
  { value: "budget", label: "Budget" },
  { value: "timeline", label: "Timeline" },
  { value: "other", label: "Other" },
];

export default function StudentRequestsPage() {
  const { supabase, user, loading: authLoading } = useSupabase();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState({
    project_id: "",
    request_type: "tool",
    title: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all projects for dropdown
  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title")
        .order("title", { ascending: true });
      if (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } else {
        setProjects(data || []);
      }
    }
    fetchProjects();
  }, [supabase]);

  // Fetch requests for the current user
  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("approval_requests")
        .select("*")
        .eq("requested_by", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching requests:", error);
        setRequests([]);
      } else {
        setRequests(data || []);
      }
      setLoading(false);
    }
    if (user) fetchRequests();
  }, [user, supabase]);

  // Stats
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "denied").length;
  const totalCount = requests.length;

  // Filtered requests
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject =
      filterProject === "all" || req.project_id === filterProject;
    return matchesSearch && matchesProject;
  });

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    if (user) {
      const { data, error } = await supabase
        .from("approval_requests")
        .select("*")
        .eq("requested_by", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching requests:", error);
        setRequests([]);
      } else {
        setRequests(data || []);
      }
    }
    setRefreshing(false);
  };

  // Handle form submit
  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (!user) throw new Error("Not authenticated");
      if (!form.project_id || !form.request_type || !form.title) {
        setError("All fields except description are required.");
        setSubmitting(false);
        return;
      }
      const { error } = await supabase.from("approval_requests").insert({
        project_id: form.project_id,
        requested_by: user.id,
        request_type: form.request_type,
        title: form.title,
        description: form.description,
      });
      if (error) throw error;
      setDialogOpen(false);
      setForm({
        project_id: "",
        request_type: "tool",
        title: "",
        description: "",
      });
      // Refresh requests
      const { data: reqData } = await supabase
        .from("approval_requests")
        .select("*")
        .eq("requested_by", user.id)
        .order("created_at", { ascending: false });
      setRequests(reqData || []);
    } catch (e: any) {
      setError(e.message || "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return <div className="text-orange-400 text-lg">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Requests</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a1a] border-orange-500 text-white">
            <DialogHeader>
              <DialogTitle className="text-orange-400">
                Create New Request
              </DialogTitle>
              <DialogDescription>
                Submit a new approval request for your project.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="text-md font-medium text-neutral-300">
                  Project
                </label>
                <Select
                  value={form.project_id}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, project_id: value }))
                  }
                  required
                >
                  <SelectTrigger className="bg-[#23232a] border-neutral-600 text-white">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#23232a] border-neutral-600">
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-md font-medium text-neutral-300">
                  Request Type
                </label>
                <Select
                  value={form.request_type}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, request_type: value }))
                  }
                  required
                >
                  <SelectTrigger className="bg-[#23232a] border-neutral-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#23232a] border-neutral-600">
                    {REQUEST_TYPES.map((rt) => (
                      <SelectItem key={rt.value} value={rt.value}>
                        {rt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-md font-medium text-neutral-300">
                  Title
                </label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="bg-[#23232a] border-neutral-600 text-white"
                  placeholder="Request title"
                  required
                />
              </div>
              <div>
                <label className="text-md font-medium text-neutral-300">
                  Description
                </label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="bg-[#23232a] border-neutral-600 text-white min-h-[100px]"
                  placeholder="Describe your request"
                  required
                />
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <DialogFooter className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="border-neutral-600 text-neutral-300"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={submitting || !form.project_id || !form.title}
                >
                  {submitting ? "Submitting..." : "Create Request"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-neutral-400">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingCount}</div>
            <p className="text-sm text-neutral-500">Awaiting review</p>
          </CardContent>
        </Card>
        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-neutral-400">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{approvedCount}</div>
            <p className="text-sm text-neutral-500">This semester</p>
          </CardContent>
        </Card>
        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-neutral-400">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{rejectedCount}</div>
            <p className="text-sm text-neutral-500">This semester</p>
          </CardContent>
        </Card>
        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-neutral-400">
              Total
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalCount}</div>
            <p className="text-sm text-neutral-500">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#1a1a1a] border-neutral-600 text-white pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="bg-[#1a1a1a] border-neutral-600 text-white w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#23232a] border-neutral-600">
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card className="bg-[#23232a] border-orange-500">
        <CardHeader>
          <CardTitle className="text-white">Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-neutral-400">Loading...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-neutral-400">No requests found.</div>
            ) : projects.length === 0 ? (
              <div className="text-neutral-400">Loading projects...</div>
            ) : (
              filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-[#18181b] rounded-lg border border-neutral-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{req.title}</h3>
                      <p className="text-md text-neutral-400">
                        Project:{" "}
                        {projects.find((p) => p.id === req.project_id)?.title ||
                          req.project_id}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Submitted:{" "}
                        {new Date(req.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-md text-neutral-300 mt-2">
                        {req.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium " +
                          (req.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : req.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : req.status === "denied"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800")
                        }
                      >
                        {req.status.charAt(0).toUpperCase() +
                          req.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
