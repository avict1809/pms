"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "../../../supabase/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  Users,
  FileText,
  ClipboardList,
  Settings,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  User,
  ArrowLeft,
  Eye,
  Edit,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectStats from "@/components/projects/ProjectStats";
import ProjectProgress from "@/components/projects/ProjectProgress";
import ProjectTabs from "@/components/projects/ProjectTabs";
import FileUpload from "@/components/projects/files/FileUpload";
import FileList from "@/components/projects/files/FileList";
import FileGrid from "@/components/projects/files/FileGrid";
import TaskList from "@/components/projects/tasks/TaskList";
import CreateTaskForm from "@/components/projects/tasks/CreateTaskForm";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
  supervisor: {
    id: string;
    display_name: string;
    email: string;
  };
  created_by: {
    id: string;
    display_name: string;
    email: string;
  };
  member_count: number;
  task_count: number;
  completed_task_count: number;
  file_count: number;
  user_role: string;
}

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabase();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [files, setFiles] = useState<any[]>([]);
  const [fileViewMode, setFileViewMode] = useState<"grid" | "list">("grid");
  const [filesLoading, setFilesLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const projectId = params.id as string;

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, user]);

  useEffect(() => {
    if (activeTab === "files") {
      fetchFiles();
    }
  }, [activeTab, projectId]);

  useEffect(() => {
    if (activeTab === "tasks") {
      fetchTasks();
    }
  }, [activeTab, projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (data.error) {
        setError("Failed to fetch project or access denied");
      } else {
        setProject(data.data);
      }
    } catch (err) {
      setError("Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    if (!projectId) return;

    setFilesLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/files`);
      const data = await response.json();

      if (data.error) {
        console.error("Failed to fetch files:", data.error);
      } else {
        setFiles(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleFileUpload = async (uploadedFiles: any[]) => {
    setFiles((prev) => [...uploadedFiles, ...prev]);
  };

  const handleFileDelete = async (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const fetchTasks = async () => {
    if (!projectId) return;

    setTasksLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      const data = await response.json();

      if (data.error) {
        console.error("Failed to fetch tasks:", data.error);
      } else {
        setTasks(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleTaskCreate = async (newTask: any) => {
    setTasks((prev) => [newTask, ...prev]);
    setShowCreateTask(false);
  };

  const handleTaskUpdate = async (taskId: string, updatedTask: any) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      )
    );
  };

  const handleTaskDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
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

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center py-8">
          <div className="text-orange-400 text-lg">Loading project...</div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !project) {
    return (
      <AuthGuard>
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <ArrowLeft
              className="text-orange-500 w-6 h-6 cursor-pointer"
              onClick={() => router.back()}
            />
            <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
              Project Not Found
            </h1>
          </div>
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium text-white mb-2">
                Access Denied
              </h3>
              <p className="text-neutral-400 mb-4">
                {error ||
                  "You don't have permission to access this project or it doesn't exist."}
              </p>
              <Button onClick={() => router.push("/projects")}>
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <Eye className="w-4 h-4" /> },
    { id: "files", label: "Files", icon: <FileText className="w-4 h-4" /> },
    {
      id: "tasks",
      label: "Tasks",
      icon: <ClipboardList className="w-4 h-4" />,
    },
    { id: "members", label: "Members", icon: <Users className="w-4 h-4" /> },
    {
      id: "finance",
      label: "Finance",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: "requests",
      label: "Requests",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
  ];

  // Add settings tab for admin/supervisor
  if (project.user_role === "admin" || project.user_role === "supervisor") {
    tabs.push({
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    });
  }

  return (
    <AuthGuard>
      <div className="space-y-8">
        {/* Project Header */}
        <ProjectHeader project={project} />

        {/* Project Stats */}
        <ProjectStats project={project} />

        {/* Project Progress */}
        <ProjectProgress project={project} />

        {/* Navigation Tabs */}
        <ProjectTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Project Overview */}
              <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <FolderKanban className="w-5 h-5" />
                    Project Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">
                        Description
                      </h4>
                      <p className="text-neutral-400">{project.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">
                          Supervisor
                        </h4>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-400">
                            {project.supervisor.display_name}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-medium mb-2">
                          Created By
                        </h4>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-400">
                            {project.created_by.display_name}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-medium mb-2">
                          Created Date
                        </h4>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-400">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-medium mb-2">
                          Last Updated
                        </h4>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-400">
                            {new Date(project.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab("files")}
                    >
                      <FileText className="w-6 h-6 text-orange-400" />
                      <span className="text-sm">View Files</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab("tasks")}
                    >
                      <ClipboardList className="w-6 h-6 text-orange-400" />
                      <span className="text-sm">View Tasks</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab("members")}
                    >
                      <Users className="w-6 h-6 text-orange-400" />
                      <span className="text-sm">View Members</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-6">
              {/* File Upload */}
              <FileUpload projectId={projectId} onUpload={handleFileUpload} />

              {/* View Mode Toggle */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">
                  Project Files ({files.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant={fileViewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFileViewMode("grid")}
                    className="flex items-center gap-2"
                  >
                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    </div>
                    Grid
                  </Button>
                  <Button
                    variant={fileViewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFileViewMode("list")}
                    className="flex items-center gap-2"
                  >
                    <div className="flex flex-col gap-0.5 w-4 h-4">
                      <div className="w-full h-0.5 bg-current rounded-sm"></div>
                      <div className="w-full h-0.5 bg-current rounded-sm"></div>
                      <div className="w-full h-0.5 bg-current rounded-sm"></div>
                    </div>
                    List
                  </Button>
                </div>
              </div>

              {/* File Display */}
              {filesLoading ? (
                <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="text-orange-400 text-lg">
                      Loading files...
                    </div>
                  </CardContent>
                </Card>
              ) : files.length === 0 ? (
                <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No Files Yet
                    </h3>
                    <p className="text-neutral-400">
                      Upload files to get started with your project.
                    </p>
                  </CardContent>
                </Card>
              ) : fileViewMode === "grid" ? (
                <FileGrid files={files} onDelete={handleFileDelete} />
              ) : (
                <FileList files={files} onDelete={handleFileDelete} />
              )}
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-6">
              {/* Task Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">
                  Project Tasks ({tasks.length})
                </h3>
                {(project.user_role === "admin" ||
                  project.user_role === "supervisor") && (
                  <Button
                    onClick={() => setShowCreateTask(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                )}
              </div>

              {/* Create Task Form */}
              {showCreateTask && (
                <CreateTaskForm
                  projectId={projectId}
                  onTaskCreate={handleTaskCreate}
                  onCancel={() => setShowCreateTask(false)}
                />
              )}

              {/* Task List */}
              {tasksLoading ? (
                <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="text-orange-400 text-lg">
                      Loading tasks...
                    </div>
                  </CardContent>
                </Card>
              ) : tasks.length === 0 ? (
                <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No Tasks Yet
                    </h3>
                    <p className="text-neutral-400">
                      Create tasks to organize your project work.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <TaskList
                  tasks={tasks}
                  projectId={projectId}
                  userRole={project.user_role}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDelete={handleTaskDelete}
                />
              )}
            </div>
          )}

          {activeTab === "members" && (
            <Card className="bg-[#23232a] border-orange-500 shadow-lg">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Team Members
                </h3>
                <p className="text-neutral-400">
                  Member management system coming soon...
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "finance" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">
                  Financial Management
                </h3>
                <Button
                  onClick={() => router.push(`/projects/${projectId}/finance`)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Detailed Finance
                </Button>
              </div>

              <Card className="bg-[#23232a] border-orange-500 shadow-lg">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Financial Dashboard
                  </h3>
                  <p className="text-neutral-400 mb-4">
                    Track income, expenses, and financial trends for this
                    project.
                  </p>
                  <Button
                    onClick={() =>
                      router.push(`/projects/${projectId}/finance`)
                    }
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Open Finance Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "requests" && (
            <Card className="bg-[#23232a] border-orange-500 shadow-lg">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Approval Requests
                </h3>
                <p className="text-neutral-400">
                  Request management system coming soon...
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && (
            <Card className="bg-[#23232a] border-orange-500 shadow-lg">
              <CardContent className="p-8 text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Project Settings
                </h3>
                <p className="text-neutral-400">
                  Project settings coming soon...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
