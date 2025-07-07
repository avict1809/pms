"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  ArrowLeft,
  Edit,
  Settings,
  Users,
  FileText,
  ClipboardList,
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

interface ProjectHeaderProps {
  project: Project;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 text-yellow-400 bg-yellow-500/10";
      case "active":
        return "border-green-500 text-green-400 bg-green-500/10";
      case "completed":
        return "border-blue-500 text-blue-400 bg-blue-500/10";
      case "archived":
        return "border-gray-500 text-gray-400 bg-gray-500/10";
      default:
        return "border-neutral-500 text-neutral-400 bg-neutral-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "active":
        return "🔄";
      case "completed":
        return "✅";
      case "archived":
        return "📁";
      default:
        return "📁";
    }
  };

  return (
    <Card className="bg-[#23232a] border-orange-500 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FolderKanban className="text-orange-500 w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {project.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={getStatusColor(project.status)}
                  >
                    <span className="mr-1">
                      {getStatusIcon(project.status)}
                    </span>
                    {project.status.charAt(0).toUpperCase() +
                      project.status.slice(1)}
                  </Badge>
                  <span className="text-neutral-400 text-md">
                    •{" "}
                    {project.user_role
                      ? project.user_role.charAt(0).toUpperCase() +
                        project.user_role.slice(1)
                      : "Unknown"}{" "}
                    Access
                  </span>
                </div>
              </div>
            </div>

            <p className="text-neutral-400 text-md line-clamp-2">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {(project.user_role === "admin" ||
              project.user_role === "supervisor") && (
              <Button
                size="sm"
                onClick={() =>
                  router.push(`/admin/projects/${project.id}/edit`)
                }
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-lg font-bold text-white">
                {project.member_count}
              </span>
            </div>
            <span className="text-sm text-neutral-400">Members</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ClipboardList className="w-4 h-4 text-orange-400" />
              <span className="text-lg font-bold text-white">
                {project.task_count}
              </span>
            </div>
            <span className="text-sm text-neutral-400">Tasks</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-orange-400" />
              <span className="text-lg font-bold text-white">
                {project.file_count || 0}
              </span>
            </div>
            <span className="text-sm text-neutral-400">Files</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg font-bold text-white">
                {project.task_count > 0
                  ? Math.round(
                      (project.completed_task_count / project.task_count) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <span className="text-sm text-neutral-400">Complete</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
