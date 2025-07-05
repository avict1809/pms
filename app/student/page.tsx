"use client";
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

export default function StudentDashboard() {
  const router = useRouter();

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
              <div className="text-3xl font-bold text-white">3</div>
              <div className="text-xs text-neutral-400">Active Projects</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <FilePlus2 className="w-5 h-5" /> Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">2</div>
              <div className="text-xs text-neutral-400">
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
              <div className="text-3xl font-bold text-white">15</div>
              <div className="text-xs text-neutral-400">Assigned Tasks</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <Clock className="w-5 h-5" /> Due Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">4</div>
              <div className="text-xs text-neutral-400">
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
              <div className="text-3xl font-bold text-white">12</div>
              <div className="text-xs text-neutral-400">Tasks Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <AlertCircle className="w-5 h-5" /> Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">2</div>
              <div className="text-xs text-neutral-400">Awaiting Approval</div>
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
                onClick={() => router.push("/student/propose")}
              >
                <FilePlus2 className="w-6 h-6 text-orange-400" />
                <span className="text-sm">Submit New Proposal</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/projects")}
              >
                <FolderKanban className="w-6 h-6 text-orange-400" />
                <span className="text-sm">View My Projects</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/profile")}
              >
                <ClipboardList className="w-6 h-6 text-orange-400" />
                <span className="text-sm">View My Tasks</span>
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
