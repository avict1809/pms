import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Megaphone,
  Search,
  RefreshCw,
  Loader2,
  FolderOpen,
  Plus,
} from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";
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

interface ProjectAnnouncementsProps {
  projectId: string;
  projectTitle?: string;
  className?: string;
  maxItems?: number;
  showCreateButton?: boolean;
  onRefresh?: () => void;
}

export default function ProjectAnnouncements({
  projectId,
  projectTitle = "Project",
  className = "",
  maxItems,
  showCreateButton = false,
  onRefresh,
}: ProjectAnnouncementsProps) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [projectId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/announcements");
      const result = await response.json();

      if (response.ok) {
        // Filter announcements for this project and global announcements
        const projectAnnouncements = result.data.filter(
          (announcement: Announcement) => {
            return (
              announcement.target_type === "global" ||
              (announcement.target_type === "project" &&
                announcement.target_id === projectId)
            );
          }
        );

        setAnnouncements(projectAnnouncements);
      } else {
        setError(result.error || "Failed to fetch announcements");
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    if (onRefresh) {
      onRefresh();
    }
    setRefreshing(false);
  };

  const filteredAnnouncements = announcements
    .filter((announcement) => {
      return (
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .slice(0, maxItems);

  if (loading) {
    return (
      <Card className={`bg-[#23232a] border-orange-500 shadow-lg ${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            <span className="ml-3 text-white">
              Loading project announcements...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-[#23232a] border-red-500 shadow-lg ${className}`}>
        <CardContent className="p-8 text-center">
          <Megaphone className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Error Loading Announcements
          </h3>
          <p className="text-neutral-400 mb-4">{error}</p>
          <Button
            onClick={fetchAnnouncements}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
            <FolderOpen className="w-6 h-6" />
            {projectTitle} Announcements
          </h2>
          <p className="text-neutral-400 mt-1">
            Stay updated with project-specific announcements
          </p>
        </div>
        <div className="flex gap-2">
          {showCreateButton && user?.role === "admin" && (
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                // TODO: Implement create announcement for this project
                console.log("Create announcement for project:", projectId);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Search project announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1a1a1a] border-neutral-600 text-white pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              showActions={false}
            />
          ))
        ) : (
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No project announcements
              </h3>
              <p className="text-neutral-400">
                {searchTerm
                  ? "Try adjusting your search"
                  : "No announcements have been posted for this project yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Show More Button */}
      {maxItems && announcements.length > maxItems && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
          >
            Show More Announcements
          </Button>
        </div>
      )}
    </div>
  );
}
