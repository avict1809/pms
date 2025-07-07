"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/supabase/client";
import { usePollingQuery } from "@/hooks/usePollingQuery";
import {
  FileText,
  ClipboardList,
  Users,
  TrendingUp,
  Activity,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import ProjectStats from "@/components/projects/ProjectStats";
import FinancialChart from "@/components/projects/finance/FinancialChart";
import dayjs from "dayjs";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
  supervisor?: {
    id: string;
    display_name: string;
    email: string;
  };
  created_by?: {
    id: string;
    display_name: string;
    email: string;
  };
  member_count: number;
  task_count: number;
  completed_task_count: number;
  file_count: number;
  user_role: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-orange-400 font-semibold text-sm uppercase tracking-wide mb-4">
      {children}
    </h2>
  );
}

const mockActivity = [
  {
    date: "2025-06-25 09:29",
    message: "Task 'Design UI' marked complete by Alice",
  },
  {
    date: "2025-06-25 08:12",
    message: "File 'requirements.pdf' uploaded by Bob",
  },
  {
    date: "2025-06-24 22:55",
    message: "Task 'API Integration' assigned to Carol",
  },
  { date: "2025-06-24 21:33", message: "Milestone 'Phase 1' reached" },
  { date: "2025-06-24 19:45", message: "New member Dave joined the project" },
];

const mockChartPoints = [300, 320, 340, 330, 350, 370, 390, 410];
const mockChartLabels = [
  "Jan 28",
  "Feb 4",
  "Feb 11",
  "Feb 18",
  "Feb 25",
  "Mar 4",
  "Mar 11",
  "Mar 18",
];

function fetchProjectData(projectId: string) {
  return Promise.all([
    supabase
      .from("projects")
      .select(
        "*, supervisor:supervisor_id(id,display_name,email), created_by:created_by(id,display_name,email)"
      )
      .eq("id", projectId)
      .single(),
    supabase.from("project_members").select("id").eq("project_id", projectId),
    supabase.from("tasks").select("id,status").eq("project_id", projectId),
    supabase.from("files").select("id").eq("project_id", projectId),
  ]).then(([projectRes, membersRes, tasksRes, filesRes]) => {
    if (projectRes.error) throw projectRes.error;
    const project = projectRes.data;
    const member_count = membersRes.data ? membersRes.data.length : 0;
    const task_count = tasksRes.data ? tasksRes.data.length : 0;
    const completed_task_count = tasksRes.data
      ? tasksRes.data.filter((t: any) => t.status === "completed").length
      : 0;
    const file_count = filesRes.data ? filesRes.data.length : 0;
    // You can set user_role as needed, for now default to 'member'
    return {
      ...project,
      member_count,
      task_count,
      completed_task_count,
      file_count,
      user_role: "member",
    };
  });
}

function fetchActivityLog(projectId: string) {
  // Example: fetch last 5 activities from tasks, files, announcements
  // You can expand this to include more types
  return Promise.all([
    supabase
      .from("tasks")
      .select("id,title,updated_at,created_by")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("files")
      .select("id,filename,uploaded_at,uploaded_by")
      .eq("project_id", projectId)
      .order("uploaded_at", { ascending: false })
      .limit(2),
    supabase
      .from("announcements")
      .select("id,title,created_at,posted_by")
      .eq("target_id", projectId)
      .order("created_at", { ascending: false })
      .limit(2),
  ]).then(([tasks, files, announcements]) => {
    const activity = [];
    if (tasks.data) {
      activity.push(
        ...tasks.data.map((t: any) => ({
          type: "task",
          date: t.updated_at,
          message: `Task '${t.title}' updated`,
        }))
      );
    }
    if (files.data) {
      activity.push(
        ...files.data.map((f: any) => ({
          type: "file",
          date: f.uploaded_at,
          message: `File '${f.filename}' uploaded`,
        }))
      );
    }
    if (announcements.data) {
      activity.push(
        ...announcements.data.map((a: any) => ({
          type: "announcement",
          date: a.created_at,
          message: `Announcement '${a.title}' posted`,
        }))
      );
    }
    // Sort by date desc
    return activity.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });
}

function fetchFinanceRecords(projectId: string) {
  return supabase
    .from("financial_records")
    .select("*")
    .eq("project_id", projectId)
    .order("date", { ascending: true });
}

function TaskStatusMatrix({ tasks }: { tasks: any[] }) {
  const statusCounts = {
    todo: 0,
    in_progress: 0,
    completed: 0,
  };
  tasks.forEach((t) => {
    if (t.status === "todo") statusCounts.todo++;
    else if (t.status === "in_progress") statusCounts.in_progress++;
    else if (t.status === "completed") statusCounts.completed++;
  });
  const max = Math.max(
    statusCounts.todo,
    statusCounts.in_progress,
    statusCounts.completed,
    1
  );
  return (
    <div className="bg-zinc-900 border border-orange-500 rounded p-4 shadow">
      <h2 className="text-orange-400 font-semibold text-sm uppercase tracking-wide mb-4">
        Task Status Matrix
      </h2>
      <div className="space-y-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className={`w-24 capitalize font-mono text-xs ${
                status === "todo"
                  ? "text-yellow-400"
                  : status === "in_progress"
                  ? "text-blue-400"
                  : "text-green-400"
              }`}
            >
              {status.replace("_", " ")}
            </span>
            <div className="flex-1 bg-zinc-800 rounded h-4 relative">
              <div
                className={`absolute left-0 top-0 h-4 rounded ${
                  status === "todo"
                    ? "bg-yellow-500"
                    : status === "in_progress"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${(count / max) * 100}%` }}
              ></div>
              <span className="absolute right-2 top-0 text-xs text-white h-4 flex items-center">
                {count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDashboardPage() {
  const { id: projectId } = useParams();
  const router = useRouter();

  // Project stats
  const {
    data: projectData,
    loading: projectLoading,
    error: projectError,
  } = usePollingQuery(
    () => fetchProjectData(projectId as string),
    [projectId],
    5000
  );

  // Activity log
  const {
    data: activityLog,
    loading: activityLoading,
    error: activityError,
  } = usePollingQuery(
    () => fetchActivityLog(projectId as string),
    [projectId],
    5000
  );

  // Finance chart
  const {
    data: financeRecords,
    loading: financeLoading,
    error: financeError,
  } = usePollingQuery(
    () =>
      fetchFinanceRecords(projectId as string).then((res) => res.data || []),
    [projectId],
    5000
  );

  if (projectLoading)
    return <p className="text-orange-400 font-mono">Loading project...</p>;
  if (projectError)
    return <p className="text-red-500 font-mono">{String(projectError)}</p>;
  if (!projectData)
    return <p className="text-neutral-400 font-mono">Project not found.</p>;

  // For the matrix chart, fetch tasks again (already fetched in fetchProjectData)
  const tasks = projectData.tasks || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <ProjectStats project={projectData} />
        <TaskStatusMatrix tasks={tasks} />
        <Card className="bg-zinc-900 border border-zinc-800">
          <CardContent className="p-6">
            <h2 className="text-orange-400 font-semibold text-sm uppercase tracking-wide mb-4">
              Activity Log
            </h2>
            <div className="space-y-2">
              {activityLoading ? (
                <div className="text-orange-400">Loading...</div>
              ) : activityError ? (
                <div className="text-red-500">Error loading activity</div>
              ) : activityLog && activityLog.length > 0 ? (
                activityLog.slice(0, 5).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-zinc-800 rounded px-3 py-2 text-sm text-neutral-200 border-l-4 border-orange-500 shadow"
                  >
                    <span className="text-orange-400 font-mono mr-2">
                      {dayjs(item.date).format("YYYY-MM-DD HH:mm")}
                    </span>
                    {item.message}
                  </div>
                ))
              ) : (
                <div className="text-neutral-400">No recent activity.</div>
              )}
            </div>
          </CardContent>
        </Card>
        <FinancialChart records={financeRecords || []} />
      </div>
      <div className="space-y-6">
        {/* Additional project info, quick links, or summary cards can go here */}
        <Card className="bg-zinc-900 border border-zinc-800">
          <CardContent className="p-6">
            <h2 className="text-orange-400 font-semibold text-sm uppercase tracking-wide mb-4">
              Project Info
            </h2>
            <div className="text-white text-lg font-bold mb-2">
              {projectData.title}
            </div>
            <div className="text-neutral-300 mb-2">
              {projectData.description}
            </div>
            <div className="text-neutral-400 text-sm">
              Supervisor: {projectData.supervisor?.display_name || "-"}
            </div>
            <div className="text-neutral-400 text-sm">
              Created by: {projectData.created_by?.display_name || "-"}
            </div>
            <div className="text-neutral-400 text-sm">
              Status: <span className="capitalize">{projectData.status}</span>
            </div>
            <div className="text-neutral-400 text-sm">
              Created: {dayjs(projectData.created_at).format("YYYY-MM-DD")}
            </div>
            <div className="text-neutral-400 text-sm">
              Updated: {dayjs(projectData.updated_at).format("YYYY-MM-DD")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
