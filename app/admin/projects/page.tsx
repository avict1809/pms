"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  Eye,
  Edit,
  Archive,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
  supervisor: {
    display_name: string;
    email: string;
  };
  member_count: number;
  task_count: number;
  completed_task_count: number;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "active" | "completed" | "archived"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects/all");
      const data = await response.json();

      if (data.error) {
        setError("Failed to fetch projects");
      } else {
        setProjects(data.data || []);
      }
    } catch (err) {
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 text-yellow-400";
      case "active":
        return "border-green-500 text-green-400";
      case "completed":
        return "border-blue-500 text-blue-400";
      case "archived":
        return "border-gray-500 text-gray-400";
      default:
        return "border-neutral-500 text-neutral-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "active":
        return <AlertCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "archived":
        return <Archive className="w-4 h-4" />;
      default:
        return <FolderKanban className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredProjects = projects.filter((project) => {
    const matchesFilter = filter === "all" || project.status === filter;
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.supervisor.display_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    archived: projects.filter((p) => p.status === "archived").length,
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="flex items-center justify-center py-8">
          <div className="text-orange-400 text-lg">Loading projects...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderKanban className="text-orange-500 w-7 h-7" />
            <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
              All Projects
            </h1>
          </div>
          <Button onClick={() => router.push("/admin/projects/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-neutral-400">Total Projects</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-green-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {stats.active}
              </div>
              <div className="text-xs text-neutral-400">Active Projects</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-blue-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">
                {stats.completed}
              </div>
              <div className="text-xs text-neutral-400">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-gray-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-400">
                {stats.archived}
              </div>
              <div className="text-xs text-neutral-400">Archived</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("active")}
                >
                  Active
                </Button>
                <Button
                  variant={filter === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("completed")}
                >
                  Completed
                </Button>
                <Button
                  variant={filter === "archived" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("archived")}
                >
                  Archived
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="p-4">
              <div className="text-red-400">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <Card className="bg-[#23232a] border-orange-500 shadow-lg">
              <CardContent className="p-8 text-center">
                <FolderKanban className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Projects Found
                </h3>
                <p className="text-neutral-400 mb-4">
                  {searchTerm || filter !== "all"
                    ? "No projects match your current filters."
                    : "No projects have been created yet."}
                </p>
                <Button onClick={() => router.push("/admin/projects/create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-[#23232a] border-orange-500 shadow-lg flex flex-col h-full"
              >
                <CardContent className="flex flex-col h-full p-6">
                  {/* Title and Status */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {project.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={getStatusColor(project.status)}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(project.status)}
                        {project.status.charAt(0).toUpperCase() +
                          project.status.slice(1)}
                      </div>
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-neutral-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-400 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{project.supervisor.display_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{project.member_count} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {project.completed_task_count}/{project.task_count}{" "}
                        tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/projects/${project.id}/edit`)
                      }
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
