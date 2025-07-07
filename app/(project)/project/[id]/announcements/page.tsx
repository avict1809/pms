"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { useParams } from "next/navigation";
import { usePollingQuery } from "@/hooks/usePollingQuery";
import { supabase } from "@/supabase/client";
import ProjectAnnouncements from "@/components/announcements/ProjectAnnouncements";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-orange-400 font-mono text-md uppercase tracking-widest mb-4">
      {children}
    </h2>
  );
}

const mockAnnouncements = [
  {
    id: 1,
    title: "Kickoff Meeting",
    content: "Project kickoff meeting scheduled for July 1st.",
    date: "2025-06-25",
  },
  {
    id: 2,
    title: "Milestone 1 Complete",
    content: "First milestone has been completed.",
    date: "2025-06-20",
  },
  {
    id: 3,
    title: "New Member",
    content: "Dave has joined the project team.",
    date: "2025-06-18",
  },
];

export default function ProjectAnnouncementsPage() {
  const { id: projectId } = useParams();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch both project-specific and global announcements
  const {
    data: announcements,
    loading,
    error,
    refetch,
  } = usePollingQuery(
    async () => {
      const { data: projectAnns, error: projectError } = await supabase
        .from("announcements")
        .select("*")
        .or(`target_id.eq.${projectId},target_type.eq.global`)
        .order("created_at", { ascending: false });
      if (projectError) throw projectError;
      return projectAnns;
    },
    [projectId],
    5000
  );

  async function handleRefresh() {
    setRefreshing(true);
    refetch && (await refetch());
    setRefreshing(false);
  }

  // TODO: Add create/edit/delete modals and handlers for CRUD

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-orange-400 font-mono uppercase tracking-widest">
          Project Announcements
        </h1>
        <button
          onClick={handleRefresh}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded transition"
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {/* Add create button/modal here */}
      {loading ? (
        <div className="text-orange-400">Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error loading announcements</div>
      ) : announcements && announcements.length > 0 ? (
        <ProjectAnnouncements
          announcements={announcements}
          projectId={projectId}
        />
      ) : (
        <div className="text-neutral-400">No announcements yet.</div>
      )}
    </div>
  );
}
