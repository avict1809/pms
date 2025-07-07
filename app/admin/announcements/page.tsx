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
  DialogFooter,
  DialogDescription,
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
import { toast } from "react-hot-toast";

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

interface DeleteAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  announcement: Announcement | null;
  isLoading?: boolean;
}

interface EditAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => Promise<void>;
  announcement: Announcement | null;
  projects: Project[];
  users: User[];
  isLoading?: boolean;
}

export default function AdminAnnouncements() {
  const { user, loading: authLoading } = useAuth();

  // Debug: Log user state
  console.log("User state:", { user, authLoading, userId: user?.id });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
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

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    announcement: Announcement | null;
  }>({ isOpen: false, announcement: null });
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    announcement: Announcement | null;
  }>({ isOpen: false, announcement: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAnnouncements();
      fetchProjects();
      fetchUsers();
    }
  }, [user?.id]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/announcements?userId=${user?.id}`
      );
      const result = await response.json();
      if (response.ok) {
        setAnnouncements(result.data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/projects/all");
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
      const response = await fetch("http://localhost:3000/api/admin/users");
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
      // Check if user is loaded
      if (!user?.id) {
        console.error("User not loaded yet");
        return;
      }

      // Debug: Log what we're sending
      const requestBody = {
        ...formData,
        userId: user.id,
      };
      console.log("Sending announcement data:", requestBody);
      console.log("User ID:", user.id);
      console.log("Form data:", formData);

      // Validate required fields
      if (!formData.title || !formData.content || !formData.target_type) {
        console.error("Missing required fields:", {
          title: !!formData.title,
          content: !!formData.content,
          target_type: !!formData.target_type,
        });
        return;
      }

      const response = await fetch("http://localhost:3000/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
      } else {
        // Debug: Log error response
        const errorData = await response.json();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const handleEditAnnouncement = async (formData: any) => {
    if (!editDialog.announcement) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/announcements/${editDialog.announcement.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, userId: user?.id }),
        }
      );
      if (response.ok) {
        toast.success("Announcement updated");
        setEditDialog({ isOpen: false, announcement: null });
        fetchAnnouncements();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update announcement");
      }
    } catch (error) {
      toast.error("Failed to update announcement");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteDialog.announcement) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/announcements/${deleteDialog.announcement.id}?userId=${user?.id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        toast.success("Announcement deleted");
        setDeleteDialog({ isOpen: false, announcement: null });
        fetchAnnouncements();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete announcement");
      }
    } catch (error) {
      toast.error("Failed to delete announcement");
    } finally {
      setActionLoading(false);
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

  // Delete Announcement Dialog
  function DeleteAnnouncementDialog(props: DeleteAnnouncementDialogProps) {
    const {
      isOpen,
      onClose,
      onConfirm,
      announcement,
      isLoading = false,
    } = props;
    if (!announcement) return null;
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#23232a] border-orange-500 shadow-lg max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-red-400">
                  Delete Announcement
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Megaphone className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">
                  Announcement Details
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Title:</span>
                  <span className="text-white ml-2 font-medium">
                    {announcement.title}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Target:</span>
                  <span className="text-white ml-2 font-medium capitalize">
                    {announcement.target_type}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-orange-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-orange-400 font-medium mb-1">Warning</p>
                  <p className="text-orange-300">
                    Deleting this announcement will permanently remove it. This
                    action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Announcement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Edit Announcement Dialog
  function EditAnnouncementDialog(props: EditAnnouncementDialogProps) {
    const {
      isOpen,
      onClose,
      onSave,
      announcement,
      projects,
      users,
      isLoading = false,
    } = props;
    const [formData, setFormData] = useState({
      title: announcement?.title || "",
      content: announcement?.content || "",
      target_type: (announcement?.target_type || "global") as
        | "global"
        | "project"
        | "student"
        | "supervisor",
      target_id: announcement?.target_id || "",
    });

    useEffect(() => {
      if (announcement) {
        setFormData({
          title: announcement.title || "",
          content: announcement.content || "",
          target_type: (announcement.target_type || "global") as
            | "global"
            | "project"
            | "student"
            | "supervisor",
          target_id: announcement.target_id || "",
        });
      }
    }, [announcement]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title || !formData.content || !formData.target_type) {
        toast.error("Please fill in all required fields");
        return;
      }
      await onSave(formData);
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#23232a] border-orange-500 shadow-lg max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-orange-400">
                  Edit Announcement
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update announcement details
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  required
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
                  required
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
                    <SelectItem value="global">Global (All Users)</SelectItem>
                    <SelectItem value="project">Project-Specific</SelectItem>
                    <SelectItem value="student">Student-Specific</SelectItem>
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
                      {formData.target_type === "student" &&
                        users
                          .filter((u) => u.role === "student")
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.display_name} ({user.email})
                            </SelectItem>
                          ))}
                      {formData.target_type === "supervisor" &&
                        users
                          .filter((u) => u.role === "supervisor")
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.display_name} ({user.email})
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  if (dataLoading) {
    return (
      <AuthGuard requiredRole="admin">
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
    <AuthGuard requiredRole="admin">
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
                      onClick={() => {
                        console.log("Create button clicked!");
                        console.log("Form data:", formData);
                        console.log("User:", user);
                        handleCreateAnnouncement();
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={
                        !formData.title || !formData.content || !user?.id
                      }
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
                          className="text-gray-400 hover:text-white"
                          onClick={() =>
                            setEditDialog({ isOpen: true, announcement })
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() =>
                            setDeleteDialog({ isOpen: true, announcement })
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
      <EditAnnouncementDialog
        isOpen={editDialog.isOpen}
        onClose={() => setEditDialog({ isOpen: false, announcement: null })}
        onSave={handleEditAnnouncement}
        announcement={editDialog.announcement}
        projects={projects}
        users={users}
        isLoading={actionLoading}
      />
      <DeleteAnnouncementDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, announcement: null })}
        onConfirm={handleDeleteAnnouncement}
        announcement={deleteDialog.announcement}
        isLoading={actionLoading}
      />
    </AuthGuard>
  );
}
