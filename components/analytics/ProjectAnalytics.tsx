"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FolderOpen,
  ClipboardList,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Activity,
} from "lucide-react";

interface ProjectAnalyticsProps {
  projectId?: string;
  className?: string;
}

interface AnalyticsData {
  projectStats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    pendingProjects: number;
  };
  taskStats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
  };
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  };
  fileStats: {
    totalFiles: number;
    totalSize: number;
    averageFilesPerProject: number;
  };
  timelineData: {
    month: string;
    projects: number;
    tasks: number;
    users: number;
  }[];
  performanceMetrics: {
    averageTaskCompletionTime: number;
    projectSuccessRate: number;
    userEngagementRate: number;
  };
}

export default function ProjectAnalytics({
  projectId,
  className = "",
}: ProjectAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchAnalyticsData();
  }, [projectId, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const url = projectId
        ? `/api/analytics/projects/${projectId}?range=${timeRange}`
        : `/api/analytics/system?range=${timeRange}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setAnalyticsData(data.data);
      } else {
        setError(data.error || "Failed to fetch analytics data");
      }
    } catch (err) {
      setError("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    return `${days}d ${Math.round(hours % 24)}h`;
  };

  if (loading) {
    return (
      <Card className={`bg-[#23232a] border-orange-500 shadow-lg ${className}`}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-neutral-400 mt-2">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-[#23232a] border-red-500 shadow-lg ${className}`}>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className={`bg-[#23232a] border-orange-500 shadow-lg ${className}`}>
        <CardContent className="p-8 text-center">
          <p className="text-neutral-400">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            {projectId ? "Project Analytics" : "System Analytics"}
          </h2>
          <p className="text-neutral-400 mt-1">
            Performance metrics and insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="bg-[#18181b] border-neutral-700 text-white w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#23232a] border-neutral-600">
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#23232a] border-blue-500 shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <FolderOpen className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-blue-400 text-lg font-bold">
                {analyticsData.projectStats.totalProjects}
              </div>
              <div className="text-neutral-400 text-md">Total Projects</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#23232a] border-green-500 shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-green-400 text-lg font-bold">
                {analyticsData.projectStats.activeProjects}
              </div>
              <div className="text-neutral-400 text-md">Active Projects</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#23232a] border-purple-500 shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <ClipboardList className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-purple-400 text-lg font-bold">
                {analyticsData.taskStats.totalTasks}
              </div>
              <div className="text-neutral-400 text-md">Total Tasks</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#23232a] border-cyan-500 shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <Users className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-cyan-400 text-lg font-bold">
                {analyticsData.userStats.totalUsers}
              </div>
              <div className="text-neutral-400 text-md">Total Users</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Progress */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Task Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {analyticsData.taskStats.pendingTasks}
              </div>
              <div className="text-neutral-400 text-md">Pending</div>
              <div className="w-full bg-neutral-700 rounded-full h-2 mt-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{
                    width: `${
                      (analyticsData.taskStats.pendingTasks /
                        analyticsData.taskStats.totalTasks) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {analyticsData.taskStats.inProgressTasks}
              </div>
              <div className="text-neutral-400 text-md">In Progress</div>
              <div className="w-full bg-neutral-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-400 h-2 rounded-full"
                  style={{
                    width: `${
                      (analyticsData.taskStats.inProgressTasks /
                        analyticsData.taskStats.totalTasks) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {analyticsData.taskStats.completedTasks}
              </div>
              <div className="text-neutral-400 text-md">Completed</div>
              <div className="w-full bg-neutral-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-400 h-2 rounded-full"
                  style={{
                    width: `${
                      (analyticsData.taskStats.completedTasks /
                        analyticsData.taskStats.totalTasks) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#23232a] border-green-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Clock className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-green-400 text-lg font-bold">
                  {formatDuration(
                    analyticsData.performanceMetrics.averageTaskCompletionTime
                  )}
                </div>
                <div className="text-neutral-400 text-md">
                  Avg Task Completion
                </div>
              </div>
            </div>
            <div className="text-sm text-neutral-400">
              Average time to complete tasks
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#23232a] border-blue-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-blue-400 text-lg font-bold">
                  {analyticsData.performanceMetrics.projectSuccessRate}%
                </div>
                <div className="text-neutral-400 text-md">Success Rate</div>
              </div>
            </div>
            <div className="text-sm text-neutral-400">
              Percentage of completed projects
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#23232a] border-purple-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Users className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-purple-400 text-lg font-bold">
                  {analyticsData.performanceMetrics.userEngagementRate}%
                </div>
                <div className="text-neutral-400 text-md">Engagement Rate</div>
              </div>
            </div>
            <div className="text-sm text-neutral-400">
              Active users in the last 30 days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Statistics */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            File Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {analyticsData.fileStats.totalFiles}
              </div>
              <div className="text-neutral-400 text-md">Total Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {formatFileSize(analyticsData.fileStats.totalSize)}
              </div>
              <div className="text-neutral-400 text-md">Total Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {analyticsData.fileStats.averageFilesPerProject.toFixed(1)}
              </div>
              <div className="text-neutral-400 text-md">Avg Files/Project</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Chart */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.timelineData.map((data, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-md text-neutral-400">
                  {data.month}
                </div>
                <div className="flex-1 flex gap-2">
                  <div className="flex-1 bg-blue-500/20 border border-blue-500 rounded p-2 text-center">
                    <div className="text-blue-400 font-bold">
                      {data.projects}
                    </div>
                    <div className="text-sm text-neutral-400">Projects</div>
                  </div>
                  <div className="flex-1 bg-green-500/20 border border-green-500 rounded p-2 text-center">
                    <div className="text-green-400 font-bold">{data.tasks}</div>
                    <div className="text-sm text-neutral-400">Tasks</div>
                  </div>
                  <div className="flex-1 bg-purple-500/20 border border-purple-500 rounded p-2 text-center">
                    <div className="text-purple-400 font-bold">
                      {data.users}
                    </div>
                    <div className="text-sm text-neutral-400">Users</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
