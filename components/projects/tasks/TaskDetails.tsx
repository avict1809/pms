"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flag,
  FileText,
  TrendingUp,
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

interface TaskDetailsProps {
  task: Task;
  onTaskUpdated: () => void;
}

export default function TaskDetails({ task, onTaskUpdated }: TaskDetailsProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <AlertTriangle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue =
    new Date(task.due_date) < new Date() && task.status !== "completed";
  const daysUntilDue = Math.ceil(
    (new Date(task.due_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Task Information */}
      <div className="lg:col-span-2 space-y-6">
        {/* Task Description */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Task Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="text-white leading-relaxed">
                {task.description || "No description provided for this task."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Task Timeline */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Task Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#18181b] rounded-lg border border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">Task Created</p>
                    <p className="text-neutral-400 text-md">
                      by {task.created_by.display_name}
                    </p>
                  </div>
                </div>
                <span className="text-neutral-400 text-md">
                  {formatDate(task.created_at)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#18181b] rounded-lg border border-neutral-700">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      task.status === "completed"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  ></div>
                  <div>
                    <p className="text-white font-medium">Status Updated</p>
                    <p className="text-neutral-400 text-md">
                      Current: {task.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <span className="text-neutral-400 text-md">
                  {formatDate(task.updated_at)}
                </span>
              </div>

              {task.status === "completed" && (
                <div className="flex items-center justify-between p-3 bg-[#18181b] rounded-lg border border-neutral-700">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-white font-medium">Task Completed</p>
                      <p className="text-neutral-400 text-md">
                        Successfully finished
                      </p>
                    </div>
                  </div>
                  <span className="text-neutral-400 text-md">
                    {formatDate(task.updated_at)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Metadata */}
      <div className="space-y-6">
        {/* Status and Priority */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400">Task Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Status:</span>
              <Badge className={getStatusColor(task.status)}>
                {getStatusIcon(task.status)}
                {task.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Priority:</span>
              <Badge className={getPriorityColor(task.priority)}>
                <Flag className="w-3 h-3 mr-1" />
                {task.priority.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Due Date Information */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400">Due Date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div
                className={`text-2xl font-bold mb-2 ${
                  isOverdue ? "text-red-400" : "text-white"
                }`}
              >
                {formatDate(task.due_date)}
              </div>
              <div
                className={`text-md ${
                  isOverdue ? "text-red-400" : "text-neutral-400"
                }`}
              >
                {isOverdue
                  ? "Overdue"
                  : daysUntilDue === 0
                  ? "Due today"
                  : daysUntilDue === 1
                  ? "Due tomorrow"
                  : `${daysUntilDue} days remaining`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Information */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400">Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-neutral-400 text-md">Assigned to:</span>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-orange-400" />
                <span className="text-white font-medium">
                  {task.assigned_to?.display_name || "Unassigned"}
                </span>
              </div>
              {task.assigned_to?.email && (
                <p className="text-neutral-400 text-md mt-1">
                  {task.assigned_to.email}
                </p>
              )}
            </div>

            <div>
              <span className="text-neutral-400 text-md">Created by:</span>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-orange-400" />
                <span className="text-white font-medium">
                  {task.created_by.display_name}
                </span>
              </div>
              <p className="text-neutral-400 text-md mt-1">
                {task.created_by.email}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-400">Days Active:</span>
              <span className="text-white font-medium">
                {Math.ceil(
                  (new Date().getTime() - new Date(task.created_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Last Updated:</span>
              <span className="text-white font-medium">
                {Math.ceil(
                  (new Date().getTime() - new Date(task.updated_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days ago
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
