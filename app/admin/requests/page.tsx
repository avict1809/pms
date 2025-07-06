"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ClipboardList,
  Search,
  Filter,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuthRedirect";

interface Request {
  id: string;
  type: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "denied";
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
  requested_by: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
  responded_by?: {
    id: string;
    display_name: string;
    email: string;
  };
  admin_comment?: string;
  project_id?: string;
  project?: {
    id: string;
    title: string;
  };
}

interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  denied: number;
  highPriority: number;
}

export default function AdminRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAction, setReviewAction] = useState<"approve" | "deny">(
    "approve"
  );
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/requests");
      const data = await response.json();

      if (response.ok) {
        setRequests(data.data || []);
      } else {
        setError(data.error || "Failed to fetch requests");
      }
    } catch (err) {
      setError("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedRequest) return;

    setReviewing(true);
    try {
      const response = await fetch(
        `/api/admin/requests/${selectedRequest.id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: reviewAction,
            comment: reviewComment,
          }),
        }
      );

      if (response.ok) {
        setShowReviewDialog(false);
        setSelectedRequest(null);
        setReviewComment("");
        fetchRequests(); // Refresh the list
      } else {
        const data = await response.json();
        setError(data.error || "Failed to review request");
      }
    } catch (err) {
      setError("Failed to review request");
    } finally {
      setReviewing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 text-yellow-400";
      case "approved":
        return "border-green-500 text-green-400";
      case "denied":
        return "border-red-500 text-red-400";
      default:
        return "border-neutral-500 text-neutral-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 text-red-400";
      case "medium":
        return "border-orange-500 text-orange-400";
      case "low":
        return "border-green-500 text-green-400";
      default:
        return "border-neutral-500 text-neutral-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tool_request":
        return "🔧";
      case "project_approval":
        return "📋";
      case "budget_request":
        return "💰";
      case "access_request":
        return "🔐";
      default:
        return "📝";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requested_by.display_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || request.status === filterStatus;
    const matchesType = filterType === "all" || request.type === filterType;
    const matchesPriority =
      filterPriority === "all" || request.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const stats: RequestStats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    denied: requests.filter((r) => r.status === "denied").length,
    highPriority: requests.filter(
      (r) => r.priority === "high" && r.status === "pending"
    ).length,
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="flex items-center justify-center py-8">
          <div className="text-orange-400 text-lg">Loading requests...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Request Management
          </h1>
          <p className="text-neutral-400">
            Review and manage approval requests from users
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-[#23232a] border-blue-500 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <ClipboardList className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-blue-400 text-lg font-bold">
                  {stats.total}
                </div>
                <div className="text-neutral-400 text-sm">Total Requests</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-yellow-500 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-yellow-400 text-lg font-bold">
                  {stats.pending}
                </div>
                <div className="text-neutral-400 text-sm">Pending</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-green-500 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-green-400 text-lg font-bold">
                  {stats.approved}
                </div>
                <div className="text-neutral-400 text-sm">Approved</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-red-500 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <div className="text-red-400 text-lg font-bold">
                  {stats.denied}
                </div>
                <div className="text-neutral-400 text-sm">Denied</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-orange-400 text-lg font-bold">
                  {stats.highPriority}
                </div>
                <div className="text-neutral-400 text-sm">High Priority</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-[#18181b] border-neutral-700 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#23232a] border-neutral-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-[#18181b] border-neutral-700 text-white w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#23232a] border-neutral-600">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="tool_request">Tool Request</SelectItem>
                    <SelectItem value="project_approval">
                      Project Approval
                    </SelectItem>
                    <SelectItem value="budget_request">
                      Budget Request
                    </SelectItem>
                    <SelectItem value="access_request">
                      Access Request
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterPriority}
                  onValueChange={setFilterPriority}
                >
                  <SelectTrigger className="bg-[#18181b] border-neutral-700 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#23232a] border-neutral-600">
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={fetchRequests}
                  className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-[#23232a] border-red-500 shadow-lg mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="bg-[#23232a] border-orange-500 shadow-lg"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <span className="text-xl">{getTypeIcon(request.type)}</span>
                    {request.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge
                      className={`text-xs ${getStatusColor(request.status)}`}
                    >
                      {request.status}
                    </Badge>
                    <Badge
                      className={`text-xs ${getPriorityColor(
                        request.priority
                      )}`}
                    >
                      {request.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-neutral-300 text-sm line-clamp-3">
                    {request.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <User className="w-3 h-3" />
                    <span>{request.requested_by.display_name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(request.created_at)}</span>
                  </div>

                  {request.project && (
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span>📋</span>
                      <span>{request.project.title}</span>
                    </div>
                  )}

                  {request.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setReviewAction("approve");
                          setShowReviewDialog(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setReviewAction("deny");
                          setShowReviewDialog(true);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white flex-1"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Deny
                      </Button>
                    </div>
                  )}

                  {request.admin_comment && (
                    <div className="pt-2 border-t border-neutral-700">
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>Admin Comment:</span>
                      </div>
                      <p className="text-xs text-neutral-300">
                        {request.admin_comment}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No requests found
              </h3>
              <p className="text-neutral-400">
                {searchTerm ||
                filterStatus !== "all" ||
                filterType !== "all" ||
                filterPriority !== "all"
                  ? "Try adjusting your search or filters"
                  : "No requests have been submitted yet"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="bg-[#23232a] border-orange-500">
            <DialogHeader>
              <DialogTitle className="text-orange-400">
                Review Request: {selectedRequest?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Add a comment about your decision..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-700">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReview}
                  disabled={reviewing}
                  className={
                    reviewAction === "approve"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }
                >
                  {reviewing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {reviewAction === "approve" ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve Request
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Deny Request
                        </>
                      )}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
