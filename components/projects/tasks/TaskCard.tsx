"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Flag,
  MessageSquare,
} from "lucide-react";

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

interface TaskCardProps {
  task: Task;
  userRole: string;
  onTaskUpdated: () => void;
}

export default function TaskCard({
  task,
  userRole,
  onTaskUpdated,
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Flag className="w-3 h-3" />;
      case "medium":
        return <Flag className="w-3 h-3" />;
      case "low":
        return <Flag className="w-3 h-3" />;
      default:
        return <Flag className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue =
    new Date(task.due_date) < new Date() && task.status !== "completed";

  const canEditTask =
    userRole === "admin" ||
    userRole === "supervisor" ||
    (userRole === "student" && task.assigned_to?.id === "current-user-id");

  const updateTaskStatus = async (newStatus: string) => {
    if (!canEditTask) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/projects/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card
      className={`bg-[#23232a] border-orange-500 shadow-lg transition-all duration-200 hover:shadow-xl ${
        isOverdue ? "border-red-500" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Task Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {task.title}
                </h3>
                <p className="text-neutral-400 text-md line-clamp-2">
                  {task.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {getPriorityIcon(task.priority)}
                  {task.priority.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-md">
                <User className="w-4 h-4 text-orange-400" />
                <span className="text-neutral-400">Assigned to:</span>
                <span className="text-white font-medium">
                  {task.assigned_to?.display_name || "Unassigned"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-md">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span className="text-neutral-400">Due:</span>
                <span
                  className={`font-medium ${
                    isOverdue ? "text-red-400" : "text-white"
                  }`}
                >
                  {formatDate(task.due_date)}
                  {isOverdue && " (Overdue)"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-md">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-neutral-400">Created:</span>
                <span className="text-white font-medium">
                  {formatDate(task.created_at)}
                </span>
              </div>
            </div>

            {/* Task Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
              <div className="flex items-center gap-2">
                {canEditTask && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTaskStatus("todo")}
                      disabled={isUpdating || task.status === "todo"}
                      className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      To Do
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTaskStatus("in_progress")}
                      disabled={isUpdating || task.status === "in_progress"}
                      className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTaskStatus("completed")}
                      disabled={isUpdating || task.status === "completed"}
                      className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Comments
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                {canEditTask && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
