"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function SupervisorDashboard() {
  return (
    <AuthGuard requiredRole="supervisor">
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="text-orange-500 w-7 h-7" />
          <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
            Supervisor Dashboard
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <FolderKanban className="w-5 h-5" /> Assigned Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">8</div>
              <div className="text-xs text-neutral-400">Active Projects</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <Users className="w-5 h-5" /> Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">24</div>
              <div className="text-xs text-neutral-400">
                Students Under Supervision
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <ClipboardList className="w-5 h-5" /> Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">12</div>
              <div className="text-xs text-neutral-400">Approval Requests</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <Clock className="w-5 h-5" /> Due This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">5</div>
              <div className="text-xs text-neutral-400">Project Milestones</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <TrendingUp className="w-5 h-5" /> Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">87%</div>
              <div className="text-xs text-neutral-400">
                Average Project Success
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <ClipboardList className="w-5 h-5" /> Tool Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">3</div>
              <div className="text-xs text-neutral-400">Pending Approvals</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
