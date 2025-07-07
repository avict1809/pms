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
import { Input } from "@/components/ui/input";

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
  user_role: string;
  progress: number;
}

export default function StudentProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-orange-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 80)
      return { text: "On Track", color: "bg-green-100 text-green-800" };
    if (progress >= 60)
      return { text: "Good Progress", color: "bg-orange-100 text-orange-800" };
    if (progress >= 40)
      return { text: "Needs Work", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Behind Schedule", color: "bg-red-100 text-red-800" };
  };

  const stats = {
    active: projects.filter((p) => p.status === "active").length,
    totalMembers: (() => {
      // Collect all user_ids from all project_members arrays
      const allMembers = projects.flatMap((p: any) =>
        Array.isArray(p.project_members)
          ? p.project_members.map((m: any) => m.user_id)
          : []
      );
      // Deduplicate by user_id
      const uniqueMembers = Array.from(new Set(allMembers));
      return uniqueMembers.length;
    })(),
    dueThisWeek: projects.filter((p) => p.status === "active").length, // Simplified for now
    averageProgress:
      projects.length > 0
        ? Math.round(
            projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
          )
        : 0,
  };

  // Filtered and paginated projects
  const filteredProjects = projects.filter((p: any) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  if (loading) {
    return (
      <AuthGuard requiredRole="student">
        <div className="flex items-center justify-center py-8">
          <div className="text-orange-400 text-lg">Loading projects...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="student">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">My Projects</h1>
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-64 bg-[#18181b] border-neutral-700 text-white"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#23232a] border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium text-neutral-400">
                Active Projects
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.active}
              </div>
              <p className="text-sm text-neutral-500">Currently working on</p>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium text-neutral-400">
                Team Members
              </CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {isNaN(stats.totalMembers) ? "0" : String(stats.totalMembers)}
              </div>
              <p className="text-sm text-neutral-500">Across all projects</p>
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
                Completion
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.averageProgress}%
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
            <CardTitle className="text-white">My Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {paginatedProjects.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                No projects found. You may not be assigned to any projects yet.
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProjects.map((project: any) => {
                  const progressStatus = getProgressStatus(project.progress);
                  // Members: list display_name (and role) for each member
                  const members = Array.isArray(project.project_members)
                    ? project.project_members.map((m: any) =>
                        m.users?.display_name
                          ? `${m.users.display_name} (${m.role})`
                          : m.user_id
                      )
                    : [];
                  // Tasks: show 0/0 if no tasks, else show completed/total
                  const completedTasks =
                    typeof project.completed_task_count === "number"
                      ? project.completed_task_count
                      : 0;
                  const totalTasks =
                    typeof project.task_count === "number"
                      ? project.task_count
                      : 0;
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
                            <Badge
                              variant="outline"
                              className="border-neutral-500 text-neutral-400"
                            >
                              {typeof project.user_role === "string" &&
                              project.user_role.length > 0
                                ? project.user_role.charAt(0).toUpperCase() +
                                  project.user_role.slice(1)
                                : "Member"}
                            </Badge>
                          </div>
                          <p className="text-md text-neutral-400 mb-2">
                            Supervisor: {project.supervisor.display_name}
                          </p>
                          <p className="text-sm text-neutral-500 mb-2">
                            Members:{" "}
                            {members.length > 0 ? members.join(", ") : "None"} •
                            Tasks: {totalTasks}/{completedTasks}
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
                                className={`${getProgressColor(
                                  project.progress
                                )} h-2 rounded-full transition-all duration-300`}
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
                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-white">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
