"use client";

import { useState } from "react";
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
import SystemSettings from "@/components/admin/SystemSettings";

// Mock data for demonstration
const mockTools = [
  {
    id: "1",
    name: "Adobe Creative Suite",
    category: "Design Software",
    description: "Professional design and creative software suite",
    status: "eligible",
    requestCount: 15,
    approvalRate: 85,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Visual Studio Code",
    category: "Development Tools",
    description: "Popular code editor with extensive extensions",
    status: "eligible",
    requestCount: 28,
    approvalRate: 95,
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "MATLAB",
    category: "Scientific Computing",
    description: "Numerical computing environment and programming language",
    status: "eligible",
    requestCount: 8,
    approvalRate: 75,
    createdAt: "2024-01-20",
  },
  {
    id: "4",
    name: "AutoCAD",
    category: "CAD Software",
    description: "Computer-aided design and drafting software",
    status: "ineligible",
    requestCount: 12,
    approvalRate: 0,
    createdAt: "2024-01-05",
  },
  {
    id: "5",
    name: "Figma",
    category: "Design Software",
    description: "Collaborative interface design tool",
    status: "eligible",
    requestCount: 22,
    approvalRate: 90,
    createdAt: "2024-01-12",
  },
  {
    id: "6",
    name: "Unity",
    category: "Game Development",
    description: "Cross-platform game engine",
    status: "eligible",
    requestCount: 5,
    approvalRate: 80,
    createdAt: "2024-01-18",
  },
];

export default function AdminToolsPage() {
  const [tools, setTools] = useState(mockTools);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"tools" | "settings">("tools");

  const handleToolUpdate = (toolId: string, updates: any) => {
    setTools((prevTools) =>
      prevTools.map((tool) =>
        tool.id === toolId ? { ...tool, ...updates } : tool
      )
    );
  };

  const handleToolDelete = (toolId: string) => {
    setTools((prevTools) => prevTools.filter((tool) => tool.id !== toolId));
  };

  const filteredTools = tools.filter(
    (tool) =>
      (tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || tool.status === statusFilter)
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
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "settings"
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            System Settings
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
              <div className="flex gap-3">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Tool Settings
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tool
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">
                    {stats.totalTools}
                  </div>
                  <div className="text-xs text-neutral-400">Total Tools</div>
                </CardContent>
              </Card>
              <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">
                    {stats.eligibleTools}
                  </div>
                  <div className="text-xs text-neutral-400">Eligible Tools</div>
                </CardContent>
              </Card>
              <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">
                    {stats.ineligibleTools}
                  </div>
                  <div className="text-xs text-neutral-400">
                    Ineligible Tools
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">
                    {stats.totalRequests}
                  </div>
                  <div className="text-xs text-neutral-400">Total Requests</div>
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
                      <option value="eligible">Eligible</option>
                      <option value="ineligible">Ineligible</option>
                    </select>
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      More Filters
                    </Button>
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
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                          {tool.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToolDelete(tool.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(tool.category)}>
                        {tool.category}
                      </Badge>
                      <Badge className={getStatusColor(tool.status)}>
                        {tool.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Requests:</span>
                        <span className="text-white ml-2">
                          {tool.requestCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Approval Rate:</span>
                        <span className="text-white ml-2">
                          {tool.approvalRate}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Added: {new Date(tool.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && <SystemSettings />}
      </div>
    </AuthGuard>
  );
}
