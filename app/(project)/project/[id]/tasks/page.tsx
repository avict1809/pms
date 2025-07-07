"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ClipboardList } from "lucide-react";
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

const mockTasks = [
  { id: 1, title: "Design UI", status: "completed", assignee: "Alice" },
  { id: 2, title: "API Integration", status: "in_progress", assignee: "Bob" },
  { id: 3, title: "Write Docs", status: "todo", assignee: "Carol" },
  { id: 4, title: "Testing", status: "todo", assignee: "Dave" },
];

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];
const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function ProjectTasksPage() {
  const { id: projectId } = useParams();
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
  });
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch tasks for this project
  const {
    data: tasks,
    loading,
    error,
    refetch,
  } = usePollingQuery(
    async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    [projectId],
    5000
  );

  async function handleRefresh() {
    setRefreshing(true);
    refetch && (await refetch());
    setRefreshing(false);
  }

  function openForm(task = null) {
    setEditingTask(task);
    setForm(
      task
        ? {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            due_date: task.due_date || "",
          }
        : {
            title: "",
            description: "",
            status: "todo",
            priority: "medium",
            due_date: "",
          }
    );
    setShowForm(true);
    setErrorMsg("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    if (!form.title) {
      setErrorMsg("Title is required");
      setSaving(false);
      return;
    }
    let result;
    if (editingTask) {
      // Update
      result = await supabase
        .from("tasks")
        .update({
          ...form,
        })
        .eq("id", editingTask.id);
    } else {
      // Create
      result = await supabase.from("tasks").insert({
        ...form,
        project_id: projectId,
      });
    }
    setSaving(false);
    if (result.error) {
      setErrorMsg(result.error.message);
    } else {
      setShowForm(false);
      refetch && refetch();
    }
  }

  async function handleDelete(taskId) {
    if (!window.confirm("Delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", taskId);
    refetch && refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-orange-400 font-mono uppercase tracking-widest">
          Project Tasks
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => openForm()}
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded transition"
          >
            + New Task
          </button>
          <button
            onClick={handleRefresh}
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded transition"
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-zinc-900 border border-orange-500 rounded p-6 shadow space-y-4 max-w-xl"
        >
          <div>
            <label className="block text-neutral-300 font-mono mb-1">
              Title
            </label>
            <input
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white mb-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-neutral-300 font-mono mb-1">
              Description
            </label>
            <textarea
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white mb-2"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-neutral-300 font-mono mb-1">
                Status
              </label>
              <select
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-neutral-300 font-mono mb-1">
                Priority
              </label>
              <select
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-neutral-300 font-mono mb-1">
                Due Date
              </label>
              <input
                type="date"
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
          {errorMsg && <div className="text-red-500 font-mono">{errorMsg}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded transition"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingTask
                ? "Update Task"
                : "Create Task"}
            </button>
            <button
              type="button"
              className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded transition"
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <div className="text-orange-400">Loading tasks...</div>
      ) : error ? (
        <div className="text-red-500">Error loading tasks</div>
      ) : tasks && tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-zinc-900 border border-orange-500 rounded p-4 shadow flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-lg">
                  {task.title}
                </span>
                <div className="flex gap-2">
                  <button
                    className="text-blue-400 hover:underline font-mono text-xs"
                    onClick={() => openForm(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-400 hover:underline font-mono text-xs"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-neutral-300 mb-1">{task.description}</div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-orange-400">Status: {task.status}</span>
                <span className="text-blue-400">Priority: {task.priority}</span>
                <span className="text-neutral-400">
                  Due: {task.due_date || "-"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-neutral-400">No tasks yet.</div>
      )}
    </div>
  );
}
