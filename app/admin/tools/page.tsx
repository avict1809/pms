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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="text-orange-500 w-7 h-7" />
            <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
              Tool Management
            </h1>
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
              <div className="text-2xl font-bold text-white">{stats.totalTools}</div>
              <div className="text-xs text-neutral-400">Total Tools</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{stats.eligibleTools}</div>
              <div className="text-xs text-neutral-400">Eligible Tools</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{stats.ineligibleTools}</div>
              <div className="text-xs text-neutral-400">Ineligible Tools</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{stats.totalRequests}</div>
              <div className="text-xs text-neutral-400">Total Requests</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white focus:border-orange-400 outline-none"
              >
                <option value="all">All Status</option>
                <option value="eligible">Eligible</option>
                <option value="ineligible">Ineligible</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tools Table */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400">All Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                      Tool
                    </th>
                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                      Requests
                    </th>
                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                      Approval Rate
                    </th>
                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                      Added
                    </th>
                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTools.map((tool) => (
                    <tr
                      key={tool.id}
                      className="border-b border-neutral-800 hover:bg-neutral-800/50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">
                            {tool.name}
                          </div>
                          <div className="text-sm text-neutral-400">
                            {tool.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getCategoryColor(tool.category)}>
                          {tool.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(tool.status)}>
                          {tool.status === "eligible" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {tool.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">
                          {tool.requestCount}
                        </div>
                        <div className="text-xs text-neutral-400">requests</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="text-white font-medium">
                            {tool.approvalRate}%
                          </div>
                          <div className="w-16 bg-neutral-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${tool.approvalRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-400 text-sm">
                        {new Date(tool.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-neutral-400 hover:text-white"
                            onClick={() => handleToolUpdate(tool.id, {
                              status: tool.status === "eligible" ? "ineligible" : "eligible"
                            })}
                          >
                            {tool.status === "eligible" ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-neutral-400 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleToolDelete(tool.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="text-orange-400">Most Requested Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tools
                  .sort((a, b) => b.requestCount - a.requestCount)
                  .slice(0, 5)
                  .map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{tool.name}</div>
                        <div className="text-sm text-neutral-400">{tool.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{tool.requestCount}</div>
                        <div className="text-xs text-neutral-400">requests</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="text-orange-400">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  tools.reduce((acc, tool) => {
                    acc[tool.category] = (acc[tool.category] || 0) + 1;
                    return acc;
                  }, {} as { [key: string]: number })
                )
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(category)}>
                          {category}
                        </Badge>
                      </div>
                      <div className="text-white font-medium">{count}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
