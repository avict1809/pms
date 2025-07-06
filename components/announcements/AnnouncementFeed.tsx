import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Megaphone, Search, Filter, RefreshCw, Loader2 } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";

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

interface AnnouncementFeedProps {
  showActions?: boolean;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
  className?: string;
  title?: string;
  description?: string;
  showFilters?: boolean;
  maxItems?: number;
}

export default function AnnouncementFeed({
  showActions = false,
  onEdit,
  onDelete,
  className = "",
  title = "Announcements",
  description = "Stay updated with the latest announcements",
  showFilters = true,
  maxItems,
}: AnnouncementFeedProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/announcements");
      const result = await response.json();

      if (response.ok) {
        setAnnouncements(result.data);
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
    setRefreshing(false);
  };

  const filteredAnnouncements = announcements
    .filter((announcement) => {
      const matchesSearch =
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === "all" || announcement.target_type === filterType;
      return matchesSearch && matchesFilter;
    })
    .slice(0, maxItems);

  if (loading) {
    return (
      <Card className={`bg-[#23232a] border-orange-500 shadow-lg ${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            <span className="ml-3 text-white">Loading announcements...</span>
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
            <Megaphone className="w-6 h-6" />
            {title}
          </h2>
          <p className="text-neutral-400 mt-1">{description}</p>
        </div>
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

      {/* Filters */}
      {showFilters && (
        <Card className="bg-[#23232a] border-orange-500 shadow-lg mb-6">
          <CardContent className="p-4">
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
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              showActions={showActions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-12 text-center">
              <Megaphone className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No announcements found
              </h3>
              <p className="text-neutral-400">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "No announcements have been posted yet"}
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
