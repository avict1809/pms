"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flag,
  MessageSquare,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import TaskDetails from "@/components/projects/tasks/TaskDetails";
import TaskComments from "@/components/projects/tasks/TaskComments";
import TaskActions from "@/components/projects/tasks/TaskActions";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string;
  created_at: string;
  updated_at: string;
  assigned_to: {
    id: string;
    display_name: string;
    email: string;
  };
  created_by: {
    id: string;
    display_name: string;
    email: string;
  };
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "details" | "comments" | "actions"
  >("details");

  useEffect(() => {
    if (params.taskId) {
      fetchTask();
    }
  }, [params.taskId]);

  const fetchTask = async () => {
    try {
      const response = await fetch(
        `/api/projects/${params.id}/tasks/${params.taskId}`
      );
      const data = await response.json();

      if (data.error) {
        setError("Failed to fetch task");
      } else {
        setTask(data.data);
      }
    } catch (err) {
      setError("Failed to fetch task");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "border-yellow-500 text-yellow-400";
      case "in_progress":
        return "border-blue-500 text-blue-400";
      case "completed":
        return "border-green-500 text-green-400";
      default:
        return "border-neutral-500 text-neutral-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 text-red-400";
      case "medium":
        return "border-orange-500 text-orange-400";
      case "low":
        return "border-green-500 text-green-400";
      default:
        return "border-neutral-500 text-neutral-400";
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
              <p className="text-neutral-400 mt-2">Loading task...</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  if (error || !task) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-[#23232a] border-red-500 shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium text-white mb-2">
                Error Loading Task
              </h3>
              <p className="text-neutral-400">{error || "Task not found"}</p>
              <Button
                onClick={() => router.back()}
                className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4 border-neutral-700 text-neutral-400 hover:bg-neutral-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Project
          </Button>

          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-white">
                      {task.title}
                    </h1>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-neutral-400">{task.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Task Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-orange-400" />
                  <span className="text-neutral-400">Assigned to:</span>
                  <span className="text-white font-medium">
                    {task.assigned_to?.display_name || "Unassigned"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span className="text-neutral-400">Due:</span>
                  <span className="text-white font-medium">
                    {new Date(task.due_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-neutral-400">Created:</span>
                  <span className="text-white font-medium">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-neutral-400">Updated:</span>
                  <span className="text-white font-medium">
                    {new Date(task.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 border-b border-neutral-700">
                <Button
                  variant={activeTab === "details" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("details")}
                  className={
                    activeTab === "details"
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "text-neutral-400 hover:text-white"
                  }
                >
                  Details
                </Button>
                <Button
                  variant={activeTab === "comments" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("comments")}
                  className={
                    activeTab === "comments"
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "text-neutral-400 hover:text-white"
                  }
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Comments
                </Button>
                <Button
                  variant={activeTab === "actions" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("actions")}
                  className={
                    activeTab === "actions"
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "text-neutral-400 hover:text-white"
                  }
                >
                  Actions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "details" && (
            <TaskDetails task={task} onTaskUpdated={fetchTask} />
          )}

          {activeTab === "comments" && (
            <TaskComments projectId={params.id as string} taskId={task.id} />
          )}

          {activeTab === "actions" && (
            <TaskActions task={task} onTaskUpdated={fetchTask} />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
