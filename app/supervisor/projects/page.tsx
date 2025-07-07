"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
  created_by: string;
  member_count: number;
  task_count: number;
  completed_task_count: number;
  progress: number;
}

export default function SupervisorProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects/my-projects");
      const data = await response.json();

      if (data.error) {
        setError("Failed to fetch projects");
      } else {
        // Calculate progress for each project
        const projectsWithProgress = (data.data || []).map(
          (project: Project) => ({
            ...project,
            progress:
              project.task_count > 0
                ? Math.round(
                    (project.completed_task_count / project.task_count) * 100
                  )
                : 0,
          })
        );
        setProjects(projectsWithProgress);
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
        return <AlertTriangle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "archived":
        return <FolderKanban className="w-4 h-4" />;
      default:
        return <FolderKanban className="w-4 h-4" />;
    }
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 80)
      return { text: "On Track", color: "bg-green-100 text-green-800" };
    if (progress >= 60)
      return { text: "Good Progress", color: "bg-orange-100 text-orange-800" };
    if (progress >= 40)
      return { text: "Needs Review", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Behind Schedule", color: "bg-red-100 text-red-800" };
  };

  const stats = {
    total: projects.length,
    students: projects.reduce((sum, p) => sum + p.member_count, 0),
    dueThisWeek: projects.filter((p) => p.status === "active").length, // Simplified for now
    completionRate:
      projects.length > 0
        ? Math.round(
            projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
          )
        : 0,
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="supervisor">
        <div className="flex items-center justify-center py-8">
          <div className="text-orange-400 text-lg">Loading projects...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="supervisor">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Assigned Projects</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#23232a] border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium text-neutral-400">
                Total Assigned
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <p className="text-sm text-neutral-500">Active projects</p>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium text-neutral-400">
                Students
              </CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.students}
              </div>
              <p className="text-sm text-neutral-500">Under supervision</p>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium text-neutral-400">
                Due This Week
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.dueThisWeek}
              </div>
              <p className="text-sm text-neutral-500">Deadlines approaching</p>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium text-neutral-400">
                Completion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.completionRate}%
              </div>
              <p className="text-sm text-neutral-500">Average progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="p-4">
              <div className="text-red-400">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader>
            <CardTitle className="text-white">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                No projects found. You may not be assigned to supervise any
                projects yet.
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => {
                  const progressStatus = getProgressStatus(project.progress);
                  return (
                    <div
                      key={project.id}
                      className="p-4 bg-[#18181b] rounded-lg border border-neutral-700 hover:border-orange-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">
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
                          <p className="text-md text-neutral-400 mb-2">
                            Team: {project.member_count} students
                          </p>
                          <p className="text-sm text-neutral-500 mb-2">
                            Tasks: {project.completed_task_count}/
                            {project.task_count} completed
                          </p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-md">
                              <span className="text-neutral-400">Progress</span>
                              <span className="text-white">
                                {project.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-neutral-700 rounded-full h-2 mt-1">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${progressStatus.color}`}
                          >
                            {progressStatus.text}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/project/${project.id}/dashboard`)
                            }
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
