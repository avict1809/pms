"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ClipboardList,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
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

interface ProjectStatsProps {
  project: Project;
}

export default function ProjectStats({ project }: ProjectStatsProps) {
  const completionRate =
    project.task_count > 0
      ? Math.round((project.completed_task_count / project.task_count) * 100)
      : 0;

  const pendingTasks = project.task_count - project.completed_task_count;

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Team Members */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-orange-400 text-md">
            <Users className="w-4 h-4" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">
            {project.member_count}
          </div>
          <div className="text-sm text-neutral-400">Active participants</div>
        </CardContent>
      </Card>

      {/* Total Tasks */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-orange-400 text-md">
            <ClipboardList className="w-4 h-4" />
            Total Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">
            {project.task_count}
          </div>
          <div className="text-sm text-neutral-400">{pendingTasks} pending</div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-orange-400 text-md">
            <TrendingUp className="w-4 h-4" />
            Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">
            {completionRate}%
          </div>
          <div className="text-sm text-neutral-400">
            {project.completed_task_count} completed
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-orange-400 text-md">
            <FileText className="w-4 h-4" />
            Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">
            {project.file_count || 0}
          </div>
          <div className="text-sm text-neutral-400">Shared documents</div>
        </CardContent>
      </Card>

      {/* Project Status */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-orange-400 text-md">
            <AlertTriangle className="w-4 h-4" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-white mb-1 capitalize">
            {project.status}
          </div>
          <div className="text-sm text-neutral-400">Project phase</div>
        </CardContent>
      </Card>

      {/* Created Date */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-orange-400 text-md">
            <Calendar className="w-4 h-4" />
            Created
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-md font-bold text-white mb-1">
            {new Date(project.created_at).toLocaleDateString()}
          </div>
          <div className="text-sm text-neutral-400">Project start date</div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-orange-400 text-md">
            <Clock className="w-4 h-4" />
            Updated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-md font-bold text-white mb-1">
            {new Date(project.updated_at).toLocaleDateString()}
          </div>
          <div className="text-sm text-neutral-400">Last activity</div>
        </CardContent>
      </Card>

      {/* User Role */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-orange-400 text-md">
            <Users className="w-4 h-4" />
            Your Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-white mb-1 capitalize">
            {project.user_role}
          </div>
          <div className="text-sm text-neutral-400">Access level</div>
        </CardContent>
      </Card>
    </div>
  );
}
