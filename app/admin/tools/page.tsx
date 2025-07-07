"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Database,
  Download,
  Upload,
  Settings,
  Shield,
  FileText,
  BarChart3,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  XCircle,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { supabase } from "@/supabase/client";

export default function AdminToolsPage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState<"tools">("tools");

  useEffect(() => {
    async function fetchTools() {
      setLoading(true);
      const { data, error } = await supabase
        .from("tool_requests")
        .select(
          `*, requested_by:users!tool_requests_requested_by_fkey(id, display_name), project:projects!tool_requests_project_id_fkey(id, title)`
        )
        .order("created_at", { ascending: false });
      if (!error) setTools(data);
      setLoading(false);
    }
    async function fetchUsers() {
      const { data } = await supabase
        .from("users")
        .select("id, display_name")
        .order("display_name");
      setUsers(data || []);
    }
    async function fetchProjects() {
      const { data } = await supabase
        .from("projects")
        .select("id, title")
        .order("title");
      setProjects(data || []);
    }
    fetchTools();
    fetchUsers();
    fetchProjects();
  }, []);

  const handleAddTool = async (tool) => {
    const { data, error } = await supabase.from("tool_requests").insert([tool]);
    if (!error) {
      setTools((prev) => [data[0], ...prev]);
      setAddDialogOpen(false);
    }
  };

  const handleEditTool = async (id, updates) => {
    const { data, error } = await supabase
      .from("tool_requests")
      .update(updates)
      .eq("id", id)
      .select();
    if (!error) {
      setTools((prev) => prev.map((t) => (t.id === id ? data[0] : t)));
      setEditDialog(null);
    }
  };

  const handleDeleteTool = async (id) => {
    const { error } = await supabase
      .from("tool_requests")
      .delete()
      .eq("id", id);
    if (!error) {
      setTools((prev) => prev.filter((t) => t.id !== id));
      setEditDialog(null);
    }
  };

  const filteredTools = tools.filter(
    (tool) =>
      (tool.tool_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.justification?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || tool.status === statusFilter) &&
      (userFilter === "all" || tool.requested_by?.id === userFilter) &&
      (projectFilter === "all" || tool.project?.id === projectFilter)
  );

  const stats = {
    totalTools: tools.length,
    eligibleTools: tools.filter((t) => t.status === "eligible").length,
    ineligibleTools: tools.filter((t) => t.status === "ineligible").length,
    totalRequests: tools.reduce((sum, t) => sum + t.requestCount, 0),
  };

  const getStatusColor = (status: string) => {
    return status === "eligible"
      ? "bg-green-500 text-white"
      : "bg-red-500 text-white";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Design Software": "bg-purple-500 text-white",
      "Development Tools": "bg-blue-500 text-white",
      "Scientific Computing": "bg-green-500 text-white",
      "CAD Software": "bg-orange-500 text-white",
      "Game Development": "bg-pink-500 text-white",
    };
    return colors[category] || "bg-gray-500 text-white";
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="text-orange-500 w-7 h-7" />
            <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
              Admin Tools & Settings
            </h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab("tools")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "tools"
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Wrench className="w-4 h-4 inline mr-2" />
            Tool Management
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "tools" && (
          <div className="space-y-8">
            {/* Tool Management Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Tool Management
                </h2>
                <p className="text-gray-400">
                  Manage available tools and software for projects
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">
                    {stats.totalTools}
                  </div>
                  <div className="text-sm text-neutral-400">Total Tools</div>
                </CardContent>
              </Card>
              <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">
                    {stats.eligibleTools}
                  </div>
                  <div className="text-sm text-neutral-400">Eligible Tools</div>
                </CardContent>
              </Card>
              <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">
                    {stats.ineligibleTools}
                  </div>
                  <div className="text-sm text-neutral-400">
                    Ineligible Tools
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">
                    {stats.totalRequests}
                  </div>
                  <div className="text-sm text-neutral-400">Total Requests</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="bg-[#23232a] border-orange-500 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-gray-700 rounded-md text-white placeholder-gray-400 focus:border-orange-400 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 bg-[#18181b] border border-gray-700 rounded-md text-white focus:border-orange-400 outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="denied">Denied</option>
                    </select>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-4 py-2 bg-[#18181b] border border-gray-700 rounded-md text-white focus:border-orange-400 outline-none"
                    >
                      <option value="all">All Submitters</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.display_name || u.id}
                        </option>
                      ))}
                    </select>
                    <select
                      value={projectFilter}
                      onChange={(e) => setProjectFilter(e.target.value)}
                      className="px-4 py-2 bg-[#18181b] border border-gray-700 rounded-md text-white focus:border-orange-400 outline-none"
                    >
                      <option value="all">All Projects</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title || p.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tools List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <Card
                  key={tool.id}
                  className="bg-[#23232a] border-orange-500 shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">
                          {tool.tool_name}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                          {tool.description}
                        </CardDescription>
                        <div className="text-sm text-gray-400 mt-2">
                          <span>
                            Submitted by:{" "}
                            {tool.requested_by?.display_name ||
                              tool.requested_by?.id ||
                              "Unknown"}
                          </span>
                          {tool.project && (
                            <span>
                              {" "}
                              &middot; Project:{" "}
                              {tool.project.title || tool.project.id}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTool(tool.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge>{tool.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      Requested:{" "}
                      {tool.created_at
                        ? new Date(tool.created_at).toLocaleDateString()
                        : "-"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
