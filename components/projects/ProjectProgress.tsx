"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
} from "lucide-react";

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

interface ProjectProgressProps {
  project: Project;
}

export default function ProjectProgress({ project }: ProjectProgressProps) {
  const completionRate =
    project.task_count > 0
      ? Math.round((project.completed_task_count / project.task_count) * 100)
      : 0;

  const pendingTasks = project.task_count - project.completed_task_count;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    if (percentage >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";
      case "active":
        return "text-green-400";
      case "completed":
        return "text-blue-400";
      case "archived":
        return "text-gray-400";
      default:
        return "text-neutral-400";
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
        return <Target className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-[#23232a] border-orange-500 shadow-lg">
      <CardHeader>
        <CardTitle className="text-orange-400 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Project Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Overall Completion</span>
            <span className="text-white font-bold">{completionRate}%</span>
          </div>
          <div className="w-full bg-[#18181b] rounded-full h-3 border border-neutral-700">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                completionRate
              )}`}
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Task Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Task Progress</span>
            <span className="text-white font-bold">
              {project.completed_task_count}/{project.task_count}
            </span>
          </div>
          <div className="w-full bg-[#18181b] rounded-full h-2 border border-neutral-700">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
                completionRate
              )}`}
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-lg font-bold text-white">
                {project.completed_task_count}
              </span>
            </div>
            <span className="text-sm text-neutral-400">Completed</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-lg font-bold text-white">
                {pendingTasks}
              </span>
            </div>
            <span className="text-sm text-neutral-400">Pending</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="w-4 h-4 text-orange-400" />
              <span className="text-lg font-bold text-white">
                {project.task_count}
              </span>
            </div>
            <span className="text-sm text-neutral-400">Total</span>
          </div>
        </div>

        {/* Project Status */}
        <div className="pt-4 border-t border-neutral-700">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Project Status</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(project.status)}
              <span className={`font-medium ${getStatusColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="pt-4 border-t border-neutral-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-md">Project Setup</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400 text-md">Complete</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-md">
                Development Phase
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-orange-400 text-md">In Progress</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-md">Testing & Review</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400 text-md">Pending</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-md">Final Delivery</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400 text-md">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
