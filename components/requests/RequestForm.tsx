import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  FileText,
  DollarSign,
  CalendarDays,
  MoreHorizontal,
  Send,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuthRedirect";

interface Project {
  id: string;
  title: string;
}

interface RequestFormProps {
  onSubmit: (data: {
    project_id: string;
    request_type: "tool" | "document" | "budget" | "timeline" | "other";
    title: string;
    description: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

export default function RequestForm({
  onSubmit,
  onCancel,
  loading = false,
  className = "",
}: RequestFormProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    project_id: "",
    request_type: "tool" as
      | "tool"
      | "document"
      | "budget"
      | "timeline"
      | "other",
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchUserProjects();
  }, []);

  const fetchUserProjects = async () => {
    try {
      const response = await fetch("/api/projects/my-projects");
      const result = await response.json();
      if (response.ok) {
        setProjects(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.project_id && formData.request_type && formData.title) {
      onSubmit(formData);
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case "tool":
        return <Wrench className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      case "budget":
        return <DollarSign className="w-4 h-4" />;
      case "timeline":
        return <CalendarDays className="w-4 h-4" />;
      case "other":
        return <MoreHorizontal className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`bg-[#23232a] border-orange-500 shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="text-orange-400 flex items-center gap-2">
          <Send className="w-5 h-5" />
          Create Approval Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-300 mb-2 block">
              Project
            </label>
            <Select
              value={formData.project_id}
              onValueChange={(value) =>
                setFormData({ ...formData, project_id: value })
              }
            >
              <SelectTrigger className="bg-[#1a1a1a] border-neutral-600 text-white">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="bg-[#23232a] border-neutral-600">
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-2 block">
              Request Type
            </label>
            <Select
              value={formData.request_type}
              onValueChange={(value: any) =>
                setFormData({ ...formData, request_type: value })
              }
            >
              <SelectTrigger className="bg-[#1a1a1a] border-neutral-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#23232a] border-neutral-600">
                <SelectItem value="tool">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Tool Request
                  </div>
                </SelectItem>
                <SelectItem value="document">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document Approval
                  </div>
                </SelectItem>
                <SelectItem value="budget">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget Request
                  </div>
                </SelectItem>
                <SelectItem value="timeline">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Timeline Change
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <MoreHorizontal className="w-4 h-4" />
                    Other
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-2 block">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-[#1a1a1a] border-neutral-600 text-white"
              placeholder="Brief title for your request"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-2 block">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-[#1a1a1a] border-neutral-600 text-white min-h-[100px]"
              placeholder="Provide detailed information about your request..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-neutral-600 text-neutral-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.project_id ||
                !formData.request_type ||
                !formData.title
              }
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
