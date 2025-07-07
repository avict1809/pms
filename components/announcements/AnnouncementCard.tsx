import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  Globe,
  FolderOpen,
  User,
  Users,
  Calendar,
  MessageSquare,
} from "lucide-react";

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

interface AnnouncementCardProps {
  announcement: Announcement;
  showActions?: boolean;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export default function AnnouncementCard({
  announcement,
  showActions = false,
  onEdit,
  onDelete,
  className = "",
}: AnnouncementCardProps) {
  const getTargetDisplay = () => {
    switch (announcement.target_type) {
      case "global":
        return {
          icon: Globe,
          label: "Global",
          color: "bg-blue-500",
          textColor: "text-blue-400",
        };
      case "project":
        return {
          icon: FolderOpen,
          label: "Project",
          color: "bg-green-500",
          textColor: "text-green-400",
        };
      case "student":
        return {
          icon: User,
          label: "Student",
          color: "bg-yellow-500",
          textColor: "text-yellow-400",
        };
      case "supervisor":
        return {
          icon: Users,
          label: "Supervisor",
          color: "bg-purple-500",
          textColor: "text-purple-400",
        };
      default:
        return {
          icon: Globe,
          label: "Unknown",
          color: "bg-gray-500",
          textColor: "text-gray-400",
        };
    }
  };

  const target = getTargetDisplay();
  const TargetIcon = target.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card
      className={`bg-[#23232a] border-orange-500 shadow-lg hover:shadow-orange-500/20 transition-all ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`w-3 h-3 rounded-full ${target.color} flex-shrink-0`}
            ></div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-white text-lg line-clamp-2 leading-tight">
                {announcement.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`border-current ${target.textColor} text-sm`}
                >
                  <TargetIcon className="w-3 h-3 mr-1" />
                  {target.label}
                </Badge>
                <span className="text-sm text-neutral-400">
                  {formatDate(announcement.created_at)}
                </span>
              </div>
            </div>
          </div>
          {showActions && (
            <div className="flex gap-1 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(announcement)}
                  className="p-1 text-neutral-400 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(announcement.id)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Megaphone className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-neutral-300 text-md leading-relaxed line-clamp-3">
            {announcement.content}
          </p>

          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{announcement.posted_by_user.display_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(announcement.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
