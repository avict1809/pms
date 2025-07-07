"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "../../../../supabase/context";
import { supabase } from "../../../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderPlus,
  Users,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  X,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

interface ProjectFormData {
  title: string;
  description: string;
  supervisor_id: string;
  members: string[];
}

interface User {
  id: string;
  display_name: string;
  email: string;
  role: string;
}

export default function CreateProjectPage() {
  const { user } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [showMemberSelector, setShowMemberSelector] = useState(false);

  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    supervisor_id: "",
    members: [],
  });

  const fetchUsers = async () => {
    try {
      // Fetch supervisors
      const { data: supervisorData } = await supabase
        .from("users")
        .select("id, display_name, email, role")
        .eq("role", "supervisor")
        .eq("is_active", true);

      // Fetch students
      const { data: studentData } = await supabase
        .from("users")
        .select("id, display_name, email, role")
        .eq("role", "member")
        .eq("is_active", true);

      setSupervisors(supervisorData || []);
      setStudents(studentData || []);
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: formData.title,
          description: formData.description,
          supervisor_id: formData.supervisor_id,
          status: "active",
          created_by: user?.id,
        })
        .select()
        .single();

      if (projectError) {
        setError("Failed to create project: " + projectError.message);
        return;
      }

      // Add project members
      const memberInserts = [
        // Add supervisor as member
        {
          project_id: projectData.id,
          user_id: formData.supervisor_id,
          role: "supervisor",
        },
        // Add selected students as members
        ...selectedMembers.map((member) => ({
          project_id: projectData.id,
          user_id: member.id,
          role: "member",
        })),
      ];

      const { error: memberError } = await supabase
        .from("project_members")
        .insert(memberInserts);

      if (memberError) {
        setError("Failed to add project members: " + memberError.message);
        return;
      }

      setSuccess("Project created successfully!");
      setTimeout(() => {
        router.push("/admin/projects");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addMember = (member: User) => {
    if (!selectedMembers.find((m) => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
    setShowMemberSelector(false);
  };

  const removeMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== memberId));
  };

  const updateFormData = (
    field: keyof ProjectFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderPlus className="text-orange-500 w-7 h-7" />
            <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
              Create New Project
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/projects")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
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

        {/* Project Creation Form */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <FolderPlus className="w-5 h-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title */}
              <div>
                <label className="block text-gray-300 mb-2 text-md font-medium">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none"
                  placeholder="Enter project title"
                />
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-gray-300 mb-2 text-md font-medium">
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
                  placeholder="Provide a detailed description of the project"
                />
              </div>

              {/* Supervisor Selection */}
              <div>
                <label className="block text-gray-300 mb-2 text-md font-medium">
                  Assign Supervisor *
                </label>
                <select
                  value={formData.supervisor_id}
                  onChange={(e) =>
                    updateFormData("supervisor_id", e.target.value)
                  }
                  required
                  className="w-full px-4 py-3 bg-[#18181b] border border-neutral-700 rounded text-white focus:border-orange-400 outline-none"
                >
                  <option value="">Select a supervisor</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.display_name} ({supervisor.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-300 text-md font-medium">
                    Team Members
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMemberSelector(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                {selectedMembers.length === 0 ? (
                  <div className="p-4 bg-[#18181b] border border-neutral-700 rounded text-neutral-400 text-center">
                    No team members selected
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-[#18181b] border border-neutral-700 rounded"
                      >
                        <div>
                          <div className="text-white font-medium">
                            {member.display_name}
                          </div>
                          <div className="text-neutral-400 text-md">
                            {member.email}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(member.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/projects")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Member Selection Modal */}
        {showMemberSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-[#23232a] border-orange-500 shadow-lg w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center justify-between">
                  <span>Select Team Members</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMemberSelector(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students
                    .filter(
                      (student) =>
                        !selectedMembers.find((m) => m.id === student.id)
                    )
                    .map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-[#18181b] border border-neutral-700 rounded hover:border-orange-400 cursor-pointer"
                        onClick={() => addMember(student)}
                      >
                        <div>
                          <div className="text-white font-medium">
                            {student.display_name}
                          </div>
                          <div className="text-neutral-400 text-md">
                            {student.email}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </div>
                {students.filter(
                  (student) => !selectedMembers.find((m) => m.id === student.id)
                ).length === 0 && (
                  <div className="text-center text-neutral-400 py-4">
                    All available students have been added to the team
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
