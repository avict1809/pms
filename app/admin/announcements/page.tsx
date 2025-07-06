"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Users,
  FolderOpen,
  Globe,
  Calendar,
  User,
  Filter,
  Search,
  Eye,
  MessageSquare,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuthRedirect";

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_type: "global" | "project" | "student" | "supervisor";
  target_id?: string;
  created_at: string;
  updated_at: string;
  posted_by: string;
  posted_by_user: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
}

interface Project {
  id: string;
  title: string;
}

interface User {
  id: string;
  display_name: string;
  email: string;
  role: string;
}

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target_type: "global" as "global" | "project" | "student" | "supervisor",
    target_id: "",
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      const result = await response.json();
      if (response.ok) {
        setAnnouncements(result.data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects/all");
      const result = await response.json();
      if (response.ok) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const result = await response.json();
      if (response.ok) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setCreateDialogOpen(false);
        setFormData({
          title: "",
          content: "",
          target_type: "global",
          target_id: "",
        });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  const getTargetDisplay = (announcement: Announcement) => {
    switch (announcement.target_type) {
      case "global":
        return { icon: Globe, label: "Global", color: "bg-blue-500" };
      case "project":
        const project = projects.find((p) => p.id === announcement.target_id);
        return {
          icon: FolderOpen,
          label: project?.title || "Unknown Project",
          color: "bg-green-500",
        };
      case "student":
        const student = users.find(
          (u) => u.id === announcement.target_id && u.role === "student"
        );
        return {
          icon: User,
          label: student?.display_name || "Unknown Student",
          color: "bg-yellow-500",
        };
      case "supervisor":
        const supervisor = users.find(
          (u) => u.id === announcement.target_id && u.role === "supervisor"
        );
        return {
          icon: Users,
          label: supervisor?.display_name || "Unknown Supervisor",
          color: "bg-purple-500",
        };
      default:
        return { icon: Globe, label: "Unknown", color: "bg-gray-500" };
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" || announcement.target_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <AuthGuard allowedRoles={["admin"]}>
        <div className="min-h-screen text-white p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-[#23232a] rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-[#23232a] rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="min-h-screen text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-orange-400 flex items-center gap-3">
                <Megaphone className="w-8 h-8" />
                Announcement Management
              </h1>
              <p className="text-neutral-400 mt-2">
                Create and manage system-wide announcements
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border-orange-500 text-white">
                <DialogHeader>
                  <DialogTitle className="text-orange-400">
                    Create New Announcement
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      Title
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="bg-[#23232a] border-neutral-600 text-white"
                      placeholder="Announcement title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      Content
                    </label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="bg-[#23232a] border-neutral-600 text-white min-h-[100px]"
                      placeholder="Announcement content"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      Target Type
                    </label>
                    <Select
                      value={formData.target_type}
                      onValueChange={(value: any) =>
                        setFormData({
                          ...formData,
                          target_type: value,
                          target_id: "",
                        })
                      }
                    >
                      <SelectTrigger className="bg-[#23232a] border-neutral-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#23232a] border-neutral-600">
                        <SelectItem value="global">
                          Global (All Users)
                        </SelectItem>
                        <SelectItem value="project">
                          Project-Specific
                        </SelectItem>
                        <SelectItem value="student">
                          Student-Specific
                        </SelectItem>
                        <SelectItem value="supervisor">
                          Supervisor-Specific
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.target_type !== "global" && (
                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        {formData.target_type === "project"
                          ? "Project"
                          : formData.target_type === "student"
                          ? "Student"
                          : "Supervisor"}
                      </label>
                      <Select
                        value={formData.target_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, target_id: value })
                        }
                      >
                        <SelectTrigger className="bg-[#23232a] border-neutral-600 text-white">
                          <SelectValue
                            placeholder={`Select ${formData.target_type}`}
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-[#23232a] border-neutral-600">
                          {formData.target_type === "project" &&
                            projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.title}
                              </SelectItem>
                            ))}
                          {["student", "supervisor"].includes(
                            formData.target_type
                          ) &&
                            users
                              .filter((u) => u.role === formData.target_type)
                              .map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.display_name} ({user.email})
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      className="border-neutral-600 text-neutral-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAnnouncement}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={!formData.title || !formData.content}
                    >
                      Create Announcement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card className="bg-[#23232a] border-orange-500 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <Input
                      placeholder="Search announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#1a1a1a] border-neutral-600 text-white pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="bg-[#1a1a1a] border-neutral-600 text-white w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#23232a] border-neutral-600">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Announcements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement) => {
              const target = getTargetDisplay(announcement);
              const TargetIcon = target.icon;

              return (
                <Card
                  key={announcement.id}
                  className="bg-[#23232a] border-orange-500 shadow-lg hover:shadow-orange-500/20 transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${target.color}`}
                        ></div>
                        <CardTitle className="text-white text-lg line-clamp-2">
                          {announcement.title}
                        </CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-neutral-400 hover:text-white"
                          onClick={() => {
                            setSelectedAnnouncement(announcement);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() =>
                            handleDeleteAnnouncement(announcement.id)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-neutral-300 text-sm line-clamp-3">
                        {announcement.content}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <TargetIcon className="w-3 h-3" />
                        <span>{target.label}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <User className="w-3 h-3" />
                        <span>{announcement.posted_by_user.display_name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(
                            announcement.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAnnouncements.length === 0 && (
            <Card className="bg-[#23232a] border-orange-500 shadow-lg">
              <CardContent className="p-12 text-center">
                <Megaphone className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No announcements found
                </h3>
                <p className="text-neutral-400">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first announcement to get started"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
