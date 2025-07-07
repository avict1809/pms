"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

export default function ProjectSettingsPage() {
  const { id: projectId } = useParams();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  // Fetch project details
  const {
    data: project,
    loading,
    error,
  } = usePollingQuery(
    async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      if (error) throw error;
      return data;
    },
    [projectId],
    5000
  );

  // Handle form changes
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle save
  async function handleSave() {
    setSaving(true);
    await supabase.from("projects").update(form).eq("id", projectId);
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-400 mb-4 font-mono uppercase tracking-widest">
        Project Settings
      </h1>
      {loading ? (
        <div className="text-orange-400">Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error loading project</div>
      ) : project ? (
        <div className="bg-zinc-900 border border-orange-500 rounded p-6 shadow space-y-4">
          <label className="block text-neutral-300 font-mono mb-2">Title</label>
          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white mb-4"
            name="title"
            defaultValue={project.title}
            onChange={handleChange}
          />
          <label className="block text-neutral-300 font-mono mb-2">
            Description
          </label>
          <textarea
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white mb-4"
            name="description"
            defaultValue={project.description}
            onChange={handleChange}
          />
          <button
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded transition"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
