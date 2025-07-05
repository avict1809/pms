"use client";
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
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminDashboard() {
  const router = useRouter();

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
              <div className="text-3xl font-bold text-white">120</div>
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
              <div className="text-3xl font-bold text-white">34</div>
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
              <div className="text-3xl font-bold text-white">8</div>
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
              <div className="text-3xl font-bold text-white">$12,500</div>
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
              <div className="text-3xl font-bold text-white">3</div>
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
              <div className="text-3xl font-bold text-white">15</div>
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
                <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                  8 Pending
                </Badge>
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
              <div className="flex items-center justify-between p-3 bg-[#18181b] rounded border border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="text-white text-sm">New proposal submitted</div>
                    <div className="text-neutral-400 text-xs">"AI-Powered Learning Platform" by John Doe</div>
                  </div>
                </div>
                <div className="text-neutral-400 text-xs">2 hours ago</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#18181b] rounded border border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-white text-sm">Project completed</div>
                    <div className="text-neutral-400 text-xs">"Mobile App Development" by Team Alpha</div>
                  </div>
                </div>
                <div className="text-neutral-400 text-xs">1 day ago</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#18181b] rounded border border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-white text-sm">New user registered</div>
                    <div className="text-neutral-400 text-xs">Jane Smith (Student)</div>
                  </div>
                </div>
                <div className="text-neutral-400 text-xs">2 days ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
