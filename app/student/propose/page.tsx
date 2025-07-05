"use client";
import { useState } from "react";
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
}

export default function ProposeProjectPage() {
  const { user } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const [formData, setFormData] = useState<ProposalFormData>({
    title: "",
    description: "",
    objectives: "",
    methodology: "",
    expectedOutcomes: "",
    timeline: "",
    resources: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from("project_proposals").insert({
        title: formData.title,
        description: formData.description,
        objectives: formData.objectives,
        methodology: formData.methodology,
        expected_outcomes: formData.expectedOutcomes,
        timeline: formData.timeline,
        resources: formData.resources,
        proposed_by: user?.id,
        status: "pending",
      });

      if (error) {
        setError("Failed to submit proposal: " + error.message);
      } else {
        setSuccess(
          "Proposal submitted successfully! It will be reviewed by an administrator."
        );
        setTimeout(() => {
          router.push("/student");
        }, 2000);
      }
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
      const { error } = await supabase.from("project_proposals").insert({
        title: formData.title,
        description: formData.description,
        objectives: formData.objectives,
        methodology: formData.methodology,
        expected_outcomes: formData.expectedOutcomes,
        timeline: formData.timeline,
        resources: formData.resources,
        proposed_by: user?.id,
        status: "draft",
      });

      if (error) {
        setError("Failed to save draft: " + error.message);
      } else {
        setSuccess("Draft saved successfully!");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ProposalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
              /* Preview Mode */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Proposal Preview
                  </h3>
                  <Button variant="outline" onClick={() => setIsPreview(false)}>
                    Edit Proposal
                  </Button>
                </div>

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
                    <h4 className="text-orange-400 font-medium mb-2">
                      Timeline
                    </h4>
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
