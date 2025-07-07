"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderKanban,
  FilePlus2,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import ProposalList from "@/components/student/ProposalList";
import { useSupabase } from "../../supabase/context";

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    proposals: 0,
    assignedTasks: 0,
    dueThisWeek: 0,
    completedTasks: 0,
    pendingRequests: 0,
    proposalsData: [],
    tasksData: [],
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetch("/api/projects/my-projects").then((res) => res.json()),
      fetch("/api/proposals/my-proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      }).then((res) => res.json()),
      fetch("/api/tasks/my-tasks").then((res) => res.json()),
      fetch("/api/approval-requests/my-requests").then((res) => res.json()),
    ])
      .then(([projectsRes, proposalsRes, tasksRes, requestsRes]) => {
        // Projects
        const projects = projectsRes.data || [];
        const activeProjects = projects.filter(
          (p: any) => p.status === "active"
        ).length;
        // Proposals
        const proposals = proposalsRes.data || [];
        // Tasks
        const tasks = tasksRes.data || [];
        const assignedTasks = tasks.length;
        const completedTasks = tasks.filter(
          (t: any) => t.status === "completed"
        ).length;
        // Due this week
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const dueThisWeek = tasks.filter((t: any) => {
          if (!t.due_date) return false;
          const due = new Date(t.due_date);
          return due >= startOfWeek && due <= endOfWeek;
        }).length;
        // Requests
        const requests = requestsRes.data || [];
        const pendingRequests = requests.filter(
          (r: any) => r.status === "pending"
        ).length;
        setStats({
          activeProjects,
          proposals: proposals.length,
          assignedTasks,
          dueThisWeek,
          completedTasks,
          pendingRequests,
          proposalsData: proposals,
          tasksData: tasks,
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <AuthGuard requiredRole="student">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-orange-400 text-lg">Loading dashboard...</div>
        </div>
      </AuthGuard>
    );
  }

  // --- Graph Data Preparation ---
  // Proposals Over Time (by month)
  let proposalDates = (stats.proposalsData || []).map(
    (proposal: any) => new Date(proposal.created_at)
  );
  proposalDates.sort((a, b) => a.getTime() - b.getTime());
  let firstProposalMonth: Date | null =
    proposalDates.length > 0
      ? new Date(
          proposalDates[0].getFullYear(),
          proposalDates[0].getMonth() - 1,
          1
        )
      : null;
  let lastProposalMonth: Date | null =
    proposalDates.length > 0 ? new Date() : null;
  // Build month range from 1 month before first proposal to current month
  let proposalMonths: string[] = [];
  if (firstProposalMonth && lastProposalMonth) {
    let current = new Date(firstProposalMonth);
    let end = new Date(
      lastProposalMonth.getFullYear(),
      lastProposalMonth.getMonth(),
      1
    );
    while (current <= end) {
      proposalMonths.push(
        `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
          2,
          "0"
        )}`
      );
      current.setMonth(current.getMonth() + 1);
    }
  }
  // Count proposals per month
  const proposalsByMonth: Record<string, number> = {};
  (stats.proposalsData || []).forEach((proposal: any) => {
    const date = new Date(proposal.created_at);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    proposalsByMonth[monthKey] = (proposalsByMonth[monthKey] || 0) + 1;
  });
  // Fill missing months with 0
  proposalMonths.forEach((month) => {
    if (!(month in proposalsByMonth)) proposalsByMonth[month] = 0;
  });
  // Prepare points for line graph
  const maxProposalCount = Math.max(
    ...proposalMonths.map((m) => proposalsByMonth[m]),
    1
  );
  // Tasks Completion Trend (by month)
  const tasksByMonth: Record<
    string,
    { completed: number; in_progress: number; todo: number }
  > = {};
  (stats.tasksData || []).forEach((task: any) => {
    const date = new Date(task.created_at);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    if (!tasksByMonth[monthKey]) {
      tasksByMonth[monthKey] = { completed: 0, in_progress: 0, todo: 0 };
    }
    if (task.status === "completed") tasksByMonth[monthKey].completed++;
    else if (task.status === "in_progress")
      tasksByMonth[monthKey].in_progress++;
    else tasksByMonth[monthKey].todo++;
  });
  const taskMonths = Object.keys(tasksByMonth).sort();
  const maxTaskCount = Math.max(
    ...Object.values(tasksByMonth).map(
      (d) => d.completed + d.in_progress + d.todo
    ),
    1
  );

  // --- Graph Components ---
  function ProposalsOverTimeGraph() {
    // SVG line graph points
    const width = 320;
    const height = 120;
    const padding = 32;
    const points = proposalMonths.map((month, i) => {
      const x =
        padding +
        ((width - 2 * padding) * i) / (proposalMonths.length - 1 || 1);
      const y =
        height -
        padding -
        ((height - 2 * padding) * proposalsByMonth[month]) / maxProposalCount;
      return { x, y, value: proposalsByMonth[month], month };
    });
    const pathD = points
      .map((pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `L ${pt.x},${pt.y}`))
      .join(" ");
    // Gradient fill under the line
    const gradientId = "proposalLineGradient";
    return (
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <FilePlus2 className="w-5 h-5" /> Proposals Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proposalMonths.length === 0 ? (
            <div className="text-neutral-400 text-center py-8">
              No proposal data available.
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <svg width={width} height={height} className="block">
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Gradient area under the line */}
                <polygon
                  fill={`url(#${gradientId})`}
                  points={
                    points.length > 0
                      ? [
                          `${points[0].x},${height - padding}`,
                          ...points.map((pt) => `${pt.x},${pt.y}`),
                          `${points[points.length - 1].x},${height - padding}`,
                        ].join(" ")
                      : ""
                  }
                />
                {/* Line path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth={3}
                  style={{ filter: "drop-shadow(0 2px 6px #f97316aa)" }}
                />
                {/* Dots */}
                {points.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={4}
                    fill="#f97316"
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
                {/* X axis labels */}
                {points.map((pt, i) => (
                  <text
                    key={"label-" + i}
                    x={pt.x}
                    y={height - padding + 16}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#bbb"
                  >
                    {new Date(pt.month + "-01").toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                    })}
                  </text>
                ))}
                {/* Y axis (optional, just 0 and max) */}
                <text
                  x={padding - 8}
                  y={height - padding}
                  fontSize={10}
                  fill="#bbb"
                  textAnchor="end"
                >
                  0
                </text>
                <text
                  x={padding - 8}
                  y={padding}
                  fontSize={10}
                  fill="#bbb"
                  textAnchor="end"
                >
                  {maxProposalCount}
                </text>
              </svg>
              <div className="flex gap-2 mt-2">
                <span className="w-4 h-2 rounded bg-orange-400 inline-block" />
                <span className="text-xs text-orange-400">Proposals</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  function TaskCompletionTrendGraph() {
    return (
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> Task Completion Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taskMonths.length === 0 ? (
            <div className="text-neutral-400 text-center py-8">
              No task data available.
            </div>
          ) : (
            <div className="flex items-end gap-4 h-32 px-2">
              {taskMonths.map((month) => {
                const data = tasksByMonth[month];
                const total = data.completed + data.in_progress + data.todo;
                return (
                  <div
                    key={month}
                    className="flex flex-col items-center flex-1"
                  >
                    {/* Completed */}
                    <div
                      className="w-4 bg-green-400 rounded-t"
                      style={{
                        height: `${(data.completed / maxTaskCount) * 100}%`,
                      }}
                      title={`Completed: ${data.completed}`}
                    ></div>
                    {/* In Progress */}
                    <div
                      className="w-4 bg-blue-400 rounded-t mt-0.5"
                      style={{
                        height: `${(data.in_progress / maxTaskCount) * 100}%`,
                      }}
                      title={`In Progress: ${data.in_progress}`}
                    ></div>
                    {/* Todo */}
                    <div
                      className="w-4 bg-yellow-400 rounded-t mt-0.5"
                      style={{ height: `${(data.todo / maxTaskCount) * 100}%` }}
                      title={`Todo: ${data.todo}`}
                    ></div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {new Date(month + "-01").toLocaleDateString("en-US", {
                        month: "short",
                        year: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-white font-bold">{total}</div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs mt-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span className="text-neutral-300">Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span className="text-neutral-300">In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span className="text-neutral-300">Todo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AuthGuard requiredRole="student">
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-orange-500 w-7 h-7" />
            <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
              Student Dashboard
            </h1>
          </div>
          <Button onClick={() => router.push("/student/propose")}>
            <Plus className="w-4 h-4 mr-2" />
            New Proposal
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <FolderKanban className="w-5 h-5" /> My Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.activeProjects}
              </div>
              <div className="text-sm text-neutral-400">Active Projects</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <FilePlus2 className="w-5 h-5" /> Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.proposals}
              </div>
              <div className="text-sm text-neutral-400">
                Submitted Proposals
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <ClipboardList className="w-5 h-5" /> My Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.assignedTasks}
              </div>
              <div className="text-sm text-neutral-400">Assigned Tasks</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <Clock className="w-5 h-5" /> Due Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.dueThisWeek}
              </div>
              <div className="text-sm text-neutral-400">
                Tasks Due This Week
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <CheckCircle className="w-5 h-5" /> Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.completedTasks}
              </div>
              <div className="text-sm text-neutral-400">Tasks Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <AlertCircle className="w-5 h-5" /> Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.pendingRequests}
              </div>
              <div className="text-sm text-neutral-400">Awaiting Approval</div>
            </CardContent>
          </Card>
        </div>

        {/* --- Insert Graphs Here --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProposalsOverTimeGraph />
          <TaskCompletionTrendGraph />
        </div>

        {/* Quick Actions */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/student/propose")}
              >
                <FilePlus2 className="w-6 h-6 text-orange-400" />
                <span className="text-md">Submit New Proposal</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/projects")}
              >
                <FolderKanban className="w-6 h-6 text-orange-400" />
                <span className="text-md">View My Projects</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/profile")}
              >
                <ClipboardList className="w-6 h-6 text-orange-400" />
                <span className="text-md">View My Tasks</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Proposals */}
        <ProposalList />
      </div>
    </AuthGuard>
  );
}
