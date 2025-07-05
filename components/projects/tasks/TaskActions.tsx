"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flag,
  Edit,
  Trash2,
  Save,
  X,
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

interface User {
  id: string;
  display_name: string;
  email: string;
  role: string;
}

interface TaskActionsProps {
  task: Task;
  onTaskUpdated: () => void;
}

export default function TaskActions({ task, onTaskUpdated }: TaskActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    due_date: task.due_date.split("T")[0], // Format for date input
    assigned_to: task.assigned_to?.id || "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const updateTaskStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onTaskUpdated();
      } else {
        setError("Failed to update task status");
      }
    } catch (error) {
      setError("Failed to update task status");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditing(false);
        onTaskUpdated();
      } else {
        setError("Failed to update task");
      }
    } catch (error) {
      setError("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this task? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Redirect back to project tasks
        window.history.back();
      } else {
        setError("Failed to delete task");
      }
    } catch (error) {
      setError("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Status Management */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Task Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-neutral-400">Current Status:</span>
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateTaskStatus("todo")}
              disabled={loading || task.status === "todo"}
              className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
            >
              <Clock className="w-3 h-3 mr-1" />
              To Do
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateTaskStatus("in_progress")}
              disabled={loading || task.status === "in_progress"}
              className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              In Progress
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateTaskStatus("completed")}
              disabled={loading || task.status === "completed"}
              className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task Editing */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Task
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              {/* Priority and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <Flag className="w-4 h-4 inline mr-1" />
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      handleInputChange("due_date", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500 rounded-md">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Save Button */}
              <div className="flex gap-2 pt-4 border-t border-neutral-700">
                <Button
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="text-neutral-400 text-sm">Title:</span>
                <p className="text-white font-medium">{task.title}</p>
              </div>
              <div>
                <span className="text-neutral-400 text-sm">Description:</span>
                <p className="text-white">
                  {task.description || "No description"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-neutral-400 text-sm">Priority:</span>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(task.priority)}>
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 text-sm">Due Date:</span>
                  <p className="text-white">
                    {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-[#23232a] border-red-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-2">Delete Task</h4>
              <p className="text-neutral-400 text-sm mb-4">
                Once you delete a task, there is no going back. Please be
                certain.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteTask}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Task
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
