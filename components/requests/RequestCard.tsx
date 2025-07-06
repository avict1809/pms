import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  FolderOpen,
  Wrench,
  FileText,
  DollarSign,
  CalendarDays,
  MoreHorizontal,
  MessageSquare,
} from "lucide-react";

interface ApprovalRequest {
  id: string;
  project_id: string;
  request_type: "tool" | "document" | "budget" | "timeline" | "other";
  title: string;
  description?: string;
  status: "pending" | "approved" | "denied";
  admin_comment?: string;
  created_at: string;
  responded_at?: string;
  requested_by: string;
  responded_by?: string;
  requested_by_user: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
  responded_by_user?: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
  project: {
    id: string;
    title: string;
  };
}

interface RequestCardProps {
  request: ApprovalRequest;
  showActions?: boolean;
  onReview?: (request: ApprovalRequest) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export default function RequestCard({
  request,
  showActions = false,
  onReview,
  onDelete,
  className = "",
}: RequestCardProps) {
  const getRequestTypeDisplay = () => {
    switch (request.request_type) {
      case "tool":
        return {
          icon: Wrench,
          label: "Tool",
          color: "bg-blue-500",
          textColor: "text-blue-400",
        };
      case "document":
        return {
          icon: FileText,
          label: "Document",
          color: "bg-green-500",
          textColor: "text-green-400",
        };
      case "budget":
        return {
          icon: DollarSign,
          label: "Budget",
          color: "bg-yellow-500",
          textColor: "text-yellow-400",
        };
      case "timeline":
        return {
          icon: CalendarDays,
          label: "Timeline",
          color: "bg-purple-500",
          textColor: "text-purple-400",
        };
      case "other":
        return {
          icon: MoreHorizontal,
          label: "Other",
          color: "bg-gray-500",
          textColor: "text-gray-400",
        };
      default:
        return {
          icon: AlertTriangle,
          label: "Unknown",
          color: "bg-red-500",
          textColor: "text-red-400",
        };
    }
  };

  const getStatusDisplay = () => {
    switch (request.status) {
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          color: "bg-yellow-500",
          textColor: "text-yellow-400",
        };
      case "approved":
        return {
          icon: CheckCircle,
          label: "Approved",
          color: "bg-green-500",
          textColor: "text-green-400",
        };
      case "denied":
        return {
          icon: XCircle,
          label: "Denied",
          color: "bg-red-500",
          textColor: "text-red-400",
        };
      default:
        return {
          icon: AlertTriangle,
          label: "Unknown",
          color: "bg-gray-500",
          textColor: "text-gray-400",
        };
    }
  };

  const requestType = getRequestTypeDisplay();
  const status = getStatusDisplay();
  const RequestTypeIcon = requestType.icon;
  const StatusIcon = status.icon;

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
              className={`w-3 h-3 rounded-full ${status.color} flex-shrink-0`}
            ></div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-white text-lg line-clamp-2 leading-tight">
                {request.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`border-current ${requestType.textColor} text-xs`}
                >
                  <RequestTypeIcon className="w-3 h-3 mr-1" />
                  {requestType.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={`border-current ${status.textColor} text-xs`}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
                <span className="text-xs text-neutral-400">
                  {formatDate(request.created_at)}
                </span>
              </div>
            </div>
          </div>
          {showActions && (
            <div className="flex gap-1 flex-shrink-0">
              {onReview && request.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReview(request)}
                  className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Review
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(request.id)}
                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {request.description && (
            <p className="text-neutral-300 text-sm leading-relaxed line-clamp-3">
              {request.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <FolderOpen className="w-3 h-3" />
            <span>{request.project.title}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <User className="w-3 h-3" />
            <span>{request.requested_by_user.display_name}</span>
          </div>

          {request.responded_by_user && (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <MessageSquare className="w-3 h-3" />
              <span>Responded by {request.responded_by_user.display_name}</span>
            </div>
          )}

          {request.admin_comment && (
            <div className="mt-3 p-3 bg-[#1a1a1a] rounded border border-neutral-600">
              <div className="text-xs text-neutral-400 mb-1">
                Admin Response:
              </div>
              <p className="text-white text-sm">{request.admin_comment}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                Created: {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>
            {request.responded_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  Responded:{" "}
                  {new Date(request.responded_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
