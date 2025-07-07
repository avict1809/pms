"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import FileUpload from "@/components/projects/files/FileUpload";
import FileList from "@/components/projects/files/FileList";
import { usePollingQuery } from "@/hooks/usePollingQuery";
import { supabase } from "@/supabase/client";

export default function ProjectFilesPage() {
  const { id: projectId } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch files for this project
  const {
    data: fetchedFiles,
    loading: pollingLoading,
    error,
    refetch,
  } = usePollingQuery(
    async () => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("project_id", projectId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    [projectId],
    5000
  );

  useEffect(() => {
    if (projectId) {
      fetch(`/api/projects/${projectId}/files`)
        .then((res) => res.json())
        .then((data) => setFiles(data.data || []))
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  const handleFileUpload = (uploadedFiles) => {
    setFiles((prev) => [...uploadedFiles, ...prev]);
  };

  const handleFileDelete = (fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  async function handleRefresh() {
    setRefreshing(true);
    refetch && (await refetch());
    setRefreshing(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-orange-400 font-mono uppercase tracking-widest">
          Project Files
        </h1>
        <button
          onClick={handleRefresh}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded transition"
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400">Project Files</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload projectId={projectId} onUpload={handleFileUpload} />
        </CardContent>
      </Card>
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400">File List</CardTitle>
        </CardHeader>
        <CardContent>
          {pollingLoading ? (
            <div className="text-orange-400">Loading files...</div>
          ) : error ? (
            <div className="text-red-500">Error loading files</div>
          ) : fetchedFiles && fetchedFiles.length > 0 ? (
            <FileList
              files={fetchedFiles}
              projectId={projectId}
              onDelete={handleFileDelete}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          ) : (
            <div className="text-neutral-400">No files uploaded yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
