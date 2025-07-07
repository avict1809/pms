"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "../../../supabase/context";
import { supabase } from "../../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Save,
  Eye,
  Users,
  UserCheck,
  UserX,
  Plus,
  X,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

interface ProposalFormData {
  title: string;
  description: string;
  objectives: string;
  methodology: string;
  expectedOutcomes: string;
  timeline: string;
  resources: string;
  selectedSupervisor: string;
  selectedTeamMembers: string[];
}

interface User {
  id: string;
  display_name: string;
  email: string;
  role: string;
}

export default function ProposeProjectPage() {
  const { user } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [availableSupervisors, setAvailableSupervisors] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [formData, setFormData] = useState<ProposalFormData>({
    title: "",
    description: "",
    objectives: "",
    methodology: "",
    expectedOutcomes: "",
    timeline: "",
    resources: "",
    selectedSupervisor: "",
    selectedTeamMembers: [],
  });

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      // Fetch students (excluding current user)
      const { data: students, error: studentsError } = await supabase
        .from("users")
        .select("id, display_name, email, role")
        .eq("role", "student")
        .eq("is_active", true)
        .neq("id", user?.id);

      // Fetch supervisors
      const { data: supervisors, error: supervisorsError } = await supabase
        .from("users")
        .select("id, display_name, email, role")
        .eq("role", "supervisor")
        .eq("is_active", true);

      if (studentsError || supervisorsError) {
        setError("Failed to fetch available users");
      } else {
        setAvailableStudents(students || []);
        setAvailableSupervisors(supervisors || []);
      }
    } catch (err) {
      setError("Failed to fetch available users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the proposal
      const { data: proposal, error: proposalError } = await supabase
        .from("project_proposals")
        .insert({
          title: formData.title,
          description: formData.description,
          objectives: formData.objectives,
          methodology: formData.methodology,
          expected_outcomes: formData.expectedOutcomes,
          timeline: formData.timeline,
          resources: formData.resources,
          proposed_by: user?.id,
          proposed_supervisor_id: formData.selectedSupervisor || null,
          status: "pending",
        })
        .select()
        .single();

      if (proposalError) {
        setError("Failed to submit proposal: " + proposalError.message);
        return;
      }

      // Add team members
      if (formData.selectedTeamMembers.length > 0) {
        const teamMembers = formData.selectedTeamMembers.map((memberId) => ({
          proposal_id: proposal.id,
          user_id: memberId,
          role: "member",
        }));

        const { error: teamError } = await supabase
          .from("proposal_team_members")
          .insert(teamMembers);

        if (teamError) {
          setError("Failed to add team members: " + teamError.message);
          return;
        }

        // Also update the team_members column in project_proposals for consistency
        const { error: updateError } = await supabase
          .from("project_proposals")
          .update({ team_members: formData.selectedTeamMembers })
          .eq("id", proposal.id);

        if (updateError) {
          console.error("Failed to update team_members column:", updateError);
          // Don't fail the whole operation, just log the error
        }
      }

      setSuccess(
        "Proposal submitted successfully! It will be reviewed by an administrator."
      );
      setTimeout(() => {
        router.push("/student");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: proposal, error: proposalError } = await supabase
        .from("project_proposals")
        .insert({
          title: formData.title,
          description: formData.description,
          objectives: formData.objectives,
          methodology: formData.methodology,
          expected_outcomes: formData.expectedOutcomes,
          timeline: formData.timeline,
          resources: formData.resources,
          proposed_by: user?.id,
          proposed_supervisor_id: formData.selectedSupervisor || null,
          status: "draft",
        })
        .select()
        .single();

      if (proposalError) {
        setError("Failed to save draft: " + proposalError.message);
        return;
      }

      // Add team members
      if (formData.selectedTeamMembers.length > 0) {
        const teamMembers = formData.selectedTeamMembers.map((memberId) => ({
          proposal_id: proposal.id,
          user_id: memberId,
          role: "member",
        }));

        const { error: teamError } = await supabase
          .from("proposal_team_members")
          .insert(teamMembers);

        if (teamError) {
          setError("Failed to add team members: " + teamError.message);
          return;
        }

        // Also update the team_members column in project_proposals for consistency
        const { error: updateError } = await supabase
          .from("project_proposals")
          .update({ team_members: formData.selectedTeamMembers })
          .eq("id", proposal.id);

        if (updateError) {
          console.error("Failed to update team_members column:", updateError);
          // Don't fail the whole operation, just log the error
        }
      }

      setSuccess("Draft saved successfully!");
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (
    field: keyof ProposalFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTeamMember = (memberId: string) => {
    if (formData.selectedTeamMembers.length >= 10) {
      setError("Maximum 10 team members allowed");
      return;
    }
    if (!formData.selectedTeamMembers.includes(memberId)) {
      updateFormData("selectedTeamMembers", [
        ...formData.selectedTeamMembers,
        memberId,
      ]);
    }
  };

  const removeTeamMember = (memberId: string) => {
    updateFormData(
      "selectedTeamMembers",
      formData.selectedTeamMembers.filter((id) => id !== memberId)
    );
  };

  const getSelectedUser = (userId: string) => {
    return availableStudents.find((user) => user.id === userId);
  };

  const getSelectedSupervisor = () => {
    return availableSupervisors.find(
      (supervisor) => supervisor.id === formData.selectedSupervisor
    );
  };

  if (loadingUsers) {
    return (
      <AuthGuard requiredRole="student">
        <div className="flex items-center justify-center py-8">
          <div className="text-orange-400 text-lg">Loading...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="student">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-orange-500 w-7 h-7" />
            <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
              Propose New Project
            </h1>
          </div>
          <Button variant="outline" onClick={() => router.push("/student")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Card className="bg-green-900/20 border-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proposal Form */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Proposal Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isPreview ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Title */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none"
                    placeholder="Enter a descriptive project title"
                  />
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Project Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData("description", e.target.value)
                    }
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none resize-none"
                    placeholder="Provide a comprehensive description of your project"
                  />
                </div>

                {/* Project Objectives */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Project Objectives *
                  </label>
                  <textarea
                    value={formData.objectives}
                    onChange={(e) =>
                      updateFormData("objectives", e.target.value)
                    }
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none resize-none"
                    placeholder="List the main objectives and goals of your project"
                  />
                </div>

                {/* Methodology */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Methodology *
                  </label>
                  <textarea
                    value={formData.methodology}
                    onChange={(e) =>
                      updateFormData("methodology", e.target.value)
                    }
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none resize-none"
                    placeholder="Describe the methods and approaches you plan to use"
                  />
                </div>

                {/* Expected Outcomes */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Expected Outcomes *
                  </label>
                  <textarea
                    value={formData.expectedOutcomes}
                    onChange={(e) =>
                      updateFormData("expectedOutcomes", e.target.value)
                    }
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none resize-none"
                    placeholder="What do you expect to achieve with this project?"
                  />
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Project Timeline *
                  </label>
                  <textarea
                    value={formData.timeline}
                    onChange={(e) => updateFormData("timeline", e.target.value)}
                    required
                    rows={2}
                    className="w-full px-4 py-3 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none resize-none"
                    placeholder="Estimated timeline and milestones"
                  />
                </div>

                {/* Required Resources */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Required Resources
                  </label>
                  <textarea
                    value={formData.resources}
                    onChange={(e) =>
                      updateFormData("resources", e.target.value)
                    }
                    rows={2}
                    className="w-full px-4 py-3 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none resize-none"
                    placeholder="List any resources, tools, or support you'll need"
                  />
                </div>

                {/* Supervisor Selection */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Proposed Supervisor *
                  </label>
                  <select
                    value={formData.selectedSupervisor}
                    onChange={(e) =>
                      updateFormData("selectedSupervisor", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 bg-[#18181b] border border-neutral-700 rounded text-white focus:border-orange-400 outline-none"
                  >
                    <option value="">Select a supervisor</option>
                    {availableSupervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.display_name} ({supervisor.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Team Members Selection */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Team Members (Max 10 students)
                  </label>
                  <div className="space-y-3">
                    {/* Selected Team Members */}
                    {formData.selectedTeamMembers.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-neutral-400">
                          Selected Members:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedTeamMembers.map((memberId) => {
                            const member = getSelectedUser(memberId);
                            return (
                              <Badge
                                key={memberId}
                                variant="outline"
                                className="border-green-500 text-green-400"
                              >
                                <div className="flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" />
                                  {member?.display_name}
                                  <button
                                    type="button"
                                    onClick={() => removeTeamMember(memberId)}
                                    className="ml-1 hover:text-red-400"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Available Students */}
                    {formData.selectedTeamMembers.length < 10 && (
                      <div>
                        <p className="text-sm text-neutral-400 mb-2">
                          Available Students:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {availableStudents
                            .filter(
                              (student) =>
                                !formData.selectedTeamMembers.includes(
                                  student.id
                                )
                            )
                            .map((student) => (
                              <button
                                key={student.id}
                                type="button"
                                onClick={() => addTeamMember(student.id)}
                                className="flex items-center justify-between p-2 bg-[#18181b] border border-neutral-700 rounded text-left hover:border-orange-400 transition-colors"
                              >
                                <div>
                                  <div className="text-white text-sm">
                                    {student.display_name}
                                  </div>
                                  <div className="text-neutral-400 text-xs">
                                    {student.email}
                                  </div>
                                </div>
                                <Plus className="w-4 h-4 text-neutral-400" />
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {formData.selectedTeamMembers.length >= 10 && (
                      <p className="text-sm text-yellow-400">
                        Maximum team size reached (10 students)
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPreview(true)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Proposal
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-orange-400 font-medium mb-2">
                    Project Title
                  </h4>
                  <p className="text-white">
                    {formData.title || "Not provided"}
                  </p>
                </div>

                <div>
                  <h4 className="text-orange-400 font-medium mb-2">
                    Description
                  </h4>
                  <p className="text-white whitespace-pre-wrap">
                    {formData.description || "Not provided"}
                  </p>
                </div>

                <div>
                  <h4 className="text-orange-400 font-medium mb-2">
                    Objectives
                  </h4>
                  <p className="text-white whitespace-pre-wrap">
                    {formData.objectives || "Not provided"}
                  </p>
                </div>

                <div>
                  <h4 className="text-orange-400 font-medium mb-2">
                    Methodology
                  </h4>
                  <p className="text-white whitespace-pre-wrap">
                    {formData.methodology || "Not provided"}
                  </p>
                </div>

                <div>
                  <h4 className="text-orange-400 font-medium mb-2">
                    Expected Outcomes
                  </h4>
                  <p className="text-white whitespace-pre-wrap">
                    {formData.expectedOutcomes || "Not provided"}
                  </p>
                </div>

                <div>
                  <h4 className="text-orange-400 font-medium mb-2">Timeline</h4>
                  <p className="text-white whitespace-pre-wrap">
                    {formData.timeline || "Not provided"}
                  </p>
                </div>

                {formData.resources && (
                  <div>
                    <h4 className="text-orange-400 font-medium mb-2">
                      Required Resources
                    </h4>
                    <p className="text-white whitespace-pre-wrap">
                      {formData.resources}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-orange-400 font-medium mb-2">
                    Proposed Supervisor
                  </h4>
                  <p className="text-white">
                    {getSelectedSupervisor()?.display_name || "Not selected"}
                  </p>
                </div>

                <div>
                  <h4 className="text-orange-400 font-medium mb-2">
                    Team Members ({formData.selectedTeamMembers.length}/10)
                  </h4>
                  {formData.selectedTeamMembers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedTeamMembers.map((memberId) => {
                        const member = getSelectedUser(memberId);
                        return (
                          <Badge
                            key={memberId}
                            variant="outline"
                            className="border-green-500 text-green-400"
                          >
                            {member?.display_name}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-neutral-400">No team members selected</p>
                  )}
                </div>

                <div className="flex gap-3 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsPreview(false)}
                    className="flex-1"
                  >
                    Back to Edit
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Proposal
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Proposal Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-neutral-300">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Be specific and detailed in your project description</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Clearly define your objectives and expected outcomes</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Provide a realistic timeline for project completion</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Select a supervisor and up to 10 team members</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>List any resources or tools you'll need for the project</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Your proposal will be reviewed by an administrator within 3-5
                  business days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
