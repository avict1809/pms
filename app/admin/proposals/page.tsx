"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Filter,
  Search,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

interface Proposal {
  id: string;
  title: string;
  description: string;
  objectives: string;
  methodology: string;
  expected_outcomes: string;
  timeline: string;
  resources: string;
  status: "draft" | "pending" | "approved" | "denied";
  created_at: string;
  updated_at: string;
  admin_comment?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  proposed_by: string;
  user: {
    display_name: string;
    email: string;
  };
}

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "denied"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch("/api/proposals/all");
      const data = await response.json();

      if (data.error) {
        setError("Failed to fetch proposals");
      } else {
        setProposals(data.data || []);
      }
    } catch (err) {
      setError("Failed to fetch proposals");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    proposalId: string,
    status: "approved" | "denied",
    comment: string
  ) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, comment }),
      });

      const data = await response.json();

      if (data.error) {
        setError("Failed to update proposal");
      } else {
        // Update the proposal in the list
        setProposals((prev) =>
          prev.map((p) =>
            p.id === proposalId
              ? {
                  ...p,
                  status,
                  admin_comment: comment,
                  reviewed_at: new Date().toISOString(),
                }
              : p
          )
        );
        setSelectedProposal(null);
      }
    } catch (err) {
      setError("Failed to update proposal");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "border-gray-500 text-gray-400";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "denied":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredProposals = proposals.filter((proposal) => {
    const matchesFilter = filter === "all" || proposal.status === filter;
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.user.display_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: proposals.length,
    pending: proposals.filter((p) => p.status === "pending").length,
    approved: proposals.filter((p) => p.status === "approved").length,
    denied: proposals.filter((p) => p.status === "denied").length,
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="flex items-center justify-center py-8">
          <div className="text-orange-400 text-lg">Loading proposals...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <FileText className="text-orange-500 w-7 h-7" />
          <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
            Project Proposals
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-neutral-400">Total Proposals</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-yellow-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {stats.pending}
              </div>
              <div className="text-xs text-neutral-400">Pending Review</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-green-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {stats.approved}
              </div>
              <div className="text-xs text-neutral-400">Approved</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-red-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400">
                {stats.denied}
              </div>
              <div className="text-xs text-neutral-400">Denied</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search proposals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={filter === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("approved")}
                >
                  Approved
                </Button>
                <Button
                  variant={filter === "denied" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("denied")}
                >
                  Denied
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="p-4">
              <div className="text-red-400">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <Card className="bg-[#23232a] border-orange-500 shadow-lg">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Proposals Found
                </h3>
                <p className="text-neutral-400">
                  {searchTerm || filter !== "all"
                    ? "No proposals match your current filters."
                    : "No proposals have been submitted yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="bg-[#23232a] border-orange-500 shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {proposal.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={getStatusColor(proposal.status)}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(proposal.status)}
                            {proposal.status.charAt(0).toUpperCase() +
                              proposal.status.slice(1)}
                          </div>
                        </Badge>
                      </div>

                      <p className="text-neutral-400 mb-3 line-clamp-2">
                        {proposal.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {proposal.user.display_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(proposal.created_at)}
                        </div>
                      </div>

                      {proposal.admin_comment && (
                        <div className="mt-3 p-3 bg-[#18181b] rounded border border-neutral-700">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm font-medium text-neutral-300">
                              Admin Comment:
                            </span>
                          </div>
                          <p className="text-neutral-400 text-sm">
                            {proposal.admin_comment}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProposal(proposal)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Proposal Review Modal */}
        {selectedProposal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-[#23232a] border-orange-500 shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Review Proposal
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedProposal(null)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProposalReviewModal
                  proposal={selectedProposal}
                  onReview={handleReview}
                  onClose={() => setSelectedProposal(null)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

// Proposal Review Modal Component
function ProposalReviewModal({
  proposal,
  onReview,
  onClose,
}: {
  proposal: Proposal;
  onReview: (
    id: string,
    status: "approved" | "denied",
    comment: string
  ) => void;
  onClose: () => void;
}) {
  const [comment, setComment] = useState(proposal.admin_comment || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (status: "approved" | "denied") => {
    setLoading(true);
    await onReview(proposal.id, status, comment);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {proposal.title}
        </h3>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-neutral-400">
            By: {proposal.user.display_name}
          </span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-400">
            Submitted: {new Date(proposal.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div>
        <h4 className="text-orange-400 font-medium mb-2">Description</h4>
        <p className="text-white whitespace-pre-wrap">{proposal.description}</p>
      </div>

      <div>
        <h4 className="text-orange-400 font-medium mb-2">Objectives</h4>
        <p className="text-white whitespace-pre-wrap">{proposal.objectives}</p>
      </div>

      <div>
        <h4 className="text-orange-400 font-medium mb-2">Methodology</h4>
        <p className="text-white whitespace-pre-wrap">{proposal.methodology}</p>
      </div>

      <div>
        <h4 className="text-orange-400 font-medium mb-2">Expected Outcomes</h4>
        <p className="text-white whitespace-pre-wrap">
          {proposal.expected_outcomes}
        </p>
      </div>

      <div>
        <h4 className="text-orange-400 font-medium mb-2">Timeline</h4>
        <p className="text-white whitespace-pre-wrap">{proposal.timeline}</p>
      </div>

      {proposal.resources && (
        <div>
          <h4 className="text-orange-400 font-medium mb-2">
            Required Resources
          </h4>
          <p className="text-white whitespace-pre-wrap">{proposal.resources}</p>
        </div>
      )}

      <div>
        <h4 className="text-orange-400 font-medium mb-2">Admin Comment</h4>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none resize-none"
          placeholder="Add your feedback or comments..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => handleSubmit("denied")}
          disabled={loading}
        >
          {loading ? "Processing..." : "Deny Proposal"}
        </Button>
        <Button onClick={() => handleSubmit("approved")} disabled={loading}>
          {loading ? "Processing..." : "Approve Proposal"}
        </Button>
      </div>
    </div>
  );
}
