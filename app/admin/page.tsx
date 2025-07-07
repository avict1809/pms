"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FilePlus2,
  DollarSign,
  Megaphone,
  Plus,
  FileText,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";

interface DashboardStats {
  users: number;
  projects: number;
  proposals: number;
  announcements: number;
  pendingActions: number;
  totalBudget: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  user: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    projects: 0,
    proposals: 0,
    announcements: 0,
    pendingActions: 0,
    totalBudget: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch("/api/analytics/system");
      const statsData = await statsResponse.json();

      if (statsData.data) {
        setStats(statsData.data);
      }

      // Fetch recent activity (we'll create this API)
      const activityResponse = await fetch("/api/analytics/recent-activity");
      const activityData = await activityResponse.json();

      if (activityData.data) {
        setRecentActivity(activityData.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TZS",
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "proposal":
        return <FilePlus2 className="w-4 h-4 text-yellow-500" />;
      case "project":
        return <FolderKanban className="w-4 h-4 text-green-500" />;
      case "user":
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-500" />;
    }
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="flex items-center justify-center py-8">
          <div className="text-orange-400 text-lg">Loading dashboard...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-orange-500 w-7 h-7" />
            <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <Users className="w-5 h-5" /> Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.users}</div>
              <div className="text-xs text-neutral-400">Active Users</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <FolderKanban className="w-5 h-5" /> Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.projects}
              </div>
              <div className="text-xs text-neutral-400">Ongoing Projects</div>
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
              <div className="text-xs text-neutral-400">Pending Proposals</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <DollarSign className="w-5 h-5" /> Finance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(stats.totalBudget)}
              </div>
              <div className="text-xs text-neutral-400">Total Budget</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <Megaphone className="w-5 h-5" /> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.announcements}
              </div>
              <div className="text-xs text-neutral-400">
                Active Announcements
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <Clock className="w-5 h-5" /> Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.pendingActions}
              </div>
              <div className="text-xs text-neutral-400">Require Attention</div>
            </CardContent>
          </Card>
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
                onClick={() => router.push("/admin/proposals")}
              >
                <FilePlus2 className="w-6 h-6 text-orange-400" />
                <span className="text-sm">Review Proposals</span>
                {stats.proposals > 0 && (
                  <Badge
                    variant="outline"
                    className="border-yellow-500 text-yellow-400"
                  >
                    {stats.proposals} Pending
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/admin/projects/create")}
              >
                <Plus className="w-6 h-6 text-orange-400" />
                <span className="text-sm">Create Project</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/admin/users")}
              >
                <Users className="w-6 h-6 text-orange-400" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/admin/projects")}
              >
                <FolderKanban className="w-6 h-6 text-orange-400" />
                <span className="text-sm">View All Projects</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/admin/announcements")}
              >
                <Megaphone className="w-6 h-6 text-orange-400" />
                <span className="text-sm">Post Announcement</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/admin/finance")}
              >
                <DollarSign className="w-6 h-6 text-orange-400" />
                <span className="text-sm">Financial Overview</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  No recent activity
                </div>
              ) : (
                recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-[#18181b] rounded border border-neutral-700"
                  >
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <div className="text-white text-sm">
                          {activity.title}
                        </div>
                        <div className="text-neutral-400 text-xs">
                          by {activity.user}
                        </div>
                      </div>
                    </div>
                    <div className="text-neutral-400 text-xs">
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
