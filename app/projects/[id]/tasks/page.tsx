"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ClipboardList,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import TaskList from "@/components/projects/tasks/TaskList";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "archived";
  user_role: string;
}

export default function ProjectTasksPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      const data = await response.json();

      if (data.error) {
        setError("Failed to fetch project");
      } else {
        setProject(data.data);
      }
    } catch (err) {
      setError("Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
              <p className="text-neutral-400 mt-2">Loading project...</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  if (error || !project) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-[#23232a] border-red-500 shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium text-white mb-2">
                Error Loading Project
              </h3>
              <p className="text-neutral-400">{error || "Project not found"}</p>
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
            onClick={() => router.push(`/projects/${params.id}`)}
            className="mb-4 border-neutral-700 text-neutral-400 hover:bg-neutral-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Project
          </Button>

          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Project Tasks
                  </CardTitle>
                  <p className="text-neutral-400 mt-1">
                    Managing tasks for:{" "}
                    <span className="text-white font-medium">
                      {project.title}
                    </span>
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/projects/${params.id}`)}
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Project
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Task List Component */}
        <TaskList
          projectId={params.id as string}
          userRole={project.user_role}
        />
      </div>
    </AuthGuard>
  );
}
