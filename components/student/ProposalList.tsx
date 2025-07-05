"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
  Trash2,
  Calendar,
  User
} from "lucide-react";
import { useSupabase } from "../../supabase/context";

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: "draft" | "pending" | "approved" | "denied";
  created_at: string;
  updated_at: string;
  admin_comment?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export default function ProposalList() {
  const { user } = useSupabase();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    fetchProposals();
  }, [user]);

  const fetchProposals = async () => {
    if (!user) return;

    try {
      const { data, error } = await fetch("/api/proposals/my-proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      }).then((res) => res.json());

      if (error) {
        setError("Failed to fetch proposals");
      } else {
        setProposals(data || []);
      }
    } catch (err) {
      setError("Failed to fetch proposals");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-orange-400 text-lg">Loading proposals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-500">
        <CardContent className="p-4">
          <div className="text-red-400">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-orange-500 w-6 h-6" />
          <h2 className="text-xl font-bold text-orange-400">My Proposals</h2>
        </div>
        <Badge variant="outline" className="border-orange-500 text-orange-400">
          {proposals.length} Total
        </Badge>
      </div>

      {/* Proposals List */}
      {proposals.length === 0 ? (
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <h3 className="text-lg font-medium text-white mb-2">No Proposals Yet</h3>
            <p className="text-neutral-400 mb-4">
              You haven't submitted any project proposals yet.
            </p>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Create Your First Proposal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="bg-[#23232a] border-orange-500 shadow-lg">
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
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </div>
                      </Badge>
                    </div>
                    
                    <p className="text-neutral-400 mb-3 line-clamp-2">
                      {proposal.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Submitted: {formatDate(proposal.created_at)}
                      </div>
                      {proposal.updated_at !== proposal.created_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Updated: {formatDate(proposal.updated_at)}
                        </div>
                      )}
                    </div>

                    {/* Admin Comment */}
                    {proposal.admin_comment && (
                      <div className="mt-3 p-3 bg-[#18181b] rounded border border-neutral-700">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-300">Admin Feedback:</span>
                        </div>
                        <p className="text-neutral-400 text-sm">{proposal.admin_comment}</p>
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
                      View
                    </Button>
                    {proposal.status === "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Proposal Details
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
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {selectedProposal.title}
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedProposal.status)}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedProposal.status)}
                      {selectedProposal.status.charAt(0).toUpperCase() + selectedProposal.status.slice(1)}
                    </div>
                  </Badge>
                  <span className="text-neutral-400 text-sm">
                    Submitted: {formatDate(selectedProposal.created_at)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-orange-400 font-medium mb-2">Description</h4>
                <p className="text-white whitespace-pre-wrap">{selectedProposal.description}</p>
              </div>

              {selectedProposal.admin_comment && (
                <div>
                  <h4 className="text-orange-400 font-medium mb-2">Admin Feedback</h4>
                  <div className="p-3 bg-[#18181b] rounded border border-neutral-700">
                    <p className="text-white">{selectedProposal.admin_comment}</p>
                    {selectedProposal.reviewed_at && (
                      <p className="text-neutral-400 text-sm mt-2">
                        Reviewed on: {formatDate(selectedProposal.reviewed_at)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProposal(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 