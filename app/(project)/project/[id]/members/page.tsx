"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useParams } from "next/navigation";
import { usePollingQuery } from "@/hooks/usePollingQuery";
import { supabase } from "@/supabase/client";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-orange-400 font-mono text-md uppercase tracking-widest mb-4">
      {children}
    </h2>
  );
}

const mockMembers = [
  { id: 1, name: "Alice", role: "Student", email: "alice@example.com" },
  { id: 2, name: "Bob", role: "Supervisor", email: "bob@example.com" },
  { id: 3, name: "Carol", role: "Student", email: "carol@example.com" },
];

export default function ProjectMembersPage() {
  const { id: projectId } = useParams();
  const [adding, setAdding] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [addError, setAddError] = useState("");

  // Fetch members for this project
  const {
    data: members,
    loading,
    error,
  } = usePollingQuery(
    async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select("*, user: user_id(id, display_name, email, role)")
        .eq("project_id", projectId)
        .order("joined_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    [projectId],
    5000
  );

  // Fetch all students in the project
  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
  } = usePollingQuery(
    async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select("*, user: user_id(id, display_name, email, role)")
        .eq("project_id", projectId)
        .eq("role", "student");
      if (error) throw error;
      return data;
    },
    [projectId],
    5000
  );

  // Fetch all users with role 'student' not already in project_members for this project
  const {
    data: availableStudents,
    loading: availableLoading,
    error: availableError,
    refetch: refetchAvailable,
  } = usePollingQuery(
    async () => {
      // Get all user_ids already in project_members for this project
      const { data: pmData, error: pmError } = await supabase
        .from("project_members")
        .select("user_id")
        .eq("project_id", projectId);
      if (pmError) throw pmError;
      const existingIds = pmData ? pmData.map((pm: any) => pm.user_id) : [];
      // Get all students not in the project
      let query = supabase
        .from("users")
        .select("id, display_name, email")
        .eq("role", "student");
      if (existingIds.length > 0) {
        query = query.not("id", "in", `(${existingIds.join(",")})`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    [projectId, members?.length],
    5000
  );

  // Add student to project
  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    if (!selectedStudent) return;
    setAdding(true);
    const { error } = await supabase.from("project_members").insert({
      project_id: projectId,
      user_id: selectedStudent,
      role: "student",
    });
    setAdding(false);
    if (error) {
      setAddError(error.message);
    } else {
      setSelectedStudent("");
      refetchAvailable && refetchAvailable();
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-orange-400 mb-4 font-mono uppercase tracking-widest">
        Project Members
      </h1>
      {/* Add Student Form */}
      <form
        onSubmit={handleAddStudent}
        className="mb-6 flex flex-col md:flex-row gap-2 items-start md:items-end"
      >
        <div>
          <label className="block text-neutral-300 font-mono mb-1">
            Add Student
          </label>
          <select
            className="bg-zinc-800 border border-blue-500 rounded px-3 py-2 text-white min-w-[200px]"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            disabled={availableLoading || adding}
          >
            <option value="">Select student...</option>
            {availableStudents &&
              availableStudents.length > 0 &&
              availableStudents.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.display_name} ({s.email})
                </option>
              ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded transition"
          disabled={!selectedStudent || adding}
        >
          {adding ? "Adding..." : "Add Student"}
        </button>
        {addError && <span className="text-red-500 ml-2">{addError}</span>}
      </form>

      {/* Add add-member button/modal here */}
      {loading ? (
        <div className="text-orange-400">Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error loading members</div>
      ) : members && members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member: any) => (
            <div
              key={member.id}
              className="bg-zinc-900 border border-orange-500 rounded p-4 shadow flex flex-col gap-1"
            >
              <span className="text-white font-bold">
                {member.user?.display_name || member.user_id}
              </span>
              <span className="text-neutral-400 text-xs">
                {member.user?.email}
              </span>
              <span className="text-orange-400 text-xs uppercase">
                {member.role}
              </span>
              <span className="text-neutral-500 text-xs">
                Joined:{" "}
                {member.joined_at
                  ? new Date(member.joined_at).toISOString().slice(0, 10)
                  : "-"}
              </span>
              {/* Add remove button here */}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-neutral-400">No members yet.</div>
      )}

      {/* Students Section */}
      <h2 className="text-lg font-bold text-blue-400 mt-8 mb-2 font-mono uppercase tracking-widest">
        Students
      </h2>
      {studentsLoading ? (
        <div className="text-blue-400">Loading students...</div>
      ) : studentsError ? (
        <div className="text-red-500">Error loading students</div>
      ) : students && students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student: any) => (
            <div
              key={student.id}
              className="bg-zinc-900 border border-blue-500 rounded p-4 shadow flex flex-col gap-1"
            >
              <span className="text-white font-bold">
                {student.user?.display_name || student.user_id}
              </span>
              <span className="text-neutral-400 text-xs">
                {student.user?.email}
              </span>
              <span className="text-blue-400 text-xs uppercase">
                {student.role}
              </span>
              <span className="text-neutral-500 text-xs">
                Joined:{" "}
                {student.joined_at
                  ? new Date(student.joined_at).toISOString().slice(0, 10)
                  : "-"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-neutral-400">No students in this project.</div>
      )}
    </div>
  );
}
