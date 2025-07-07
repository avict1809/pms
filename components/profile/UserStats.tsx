"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Award,
  Target,
} from "lucide-react";

interface UserStatsProps {
  user: {
    id: string;
    email: string;
    display_name: string;
    role: string;
    is_active: boolean;
    is_first_login: boolean;
    created_at: string;
  };
  stats?: {
    totalProjects?: number;
    activeProjects?: number;
    completedProjects?: number;
    totalTasks?: number;
    completedTasks?: number;
    daysActive?: number;
  };
}

export default function UserStats({ user, stats }: UserStatsProps) {
  const daysActive =
    stats?.daysActive ||
    Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 text-white";
      case "supervisor":
        return "bg-blue-500 text-white";
      case "student":
        return "border-green-500 text-green-400";
      default:
        return "border-neutral-500 text-neutral-400";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Award className="w-4 h-4" />;
      case "supervisor":
        return <Target className="w-4 h-4" />;
      case "student":
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* User Overview */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400">User Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-white font-medium">{user.display_name}</h3>
                <p className="text-neutral-400 text-md">{user.email}</p>
              </div>
            </div>
            <Badge
              variant={
                user.role === "admin"
                  ? "default"
                  : user.role === "supervisor"
                  ? "secondary"
                  : "outline"
              }
              className={getRoleColor(user.role)}
            >
              <div className="flex items-center gap-1">
                {getRoleIcon(user.role)}
                {user.role}
              </div>
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <div>
                <div className="text-md text-neutral-400">Member Since</div>
                <div className="text-white font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              <div>
                <div className="text-md text-neutral-400">Days Active</div>
                <div className="text-white font-medium">{daysActive}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Activity Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#18181b] rounded border border-neutral-700">
              <div className="text-2xl font-bold text-white">
                {stats?.totalProjects || 0}
              </div>
              <div className="text-sm text-neutral-400">Total Projects</div>
            </div>
            <div className="text-center p-4 bg-[#18181b] rounded border border-neutral-700">
              <div className="text-2xl font-bold text-blue-400">
                {stats?.activeProjects || 0}
              </div>
              <div className="text-sm text-neutral-400">Active Projects</div>
            </div>
            <div className="text-center p-4 bg-[#18181b] rounded border border-neutral-700">
              <div className="text-2xl font-bold text-green-400">
                {stats?.completedProjects || 0}
              </div>
              <div className="text-sm text-neutral-400">Completed</div>
            </div>
            <div className="text-center p-4 bg-[#18181b] rounded border border-neutral-700">
              <div className="text-2xl font-bold text-orange-400">
                {stats?.totalTasks || 0}
              </div>
              <div className="text-sm text-neutral-400">Total Tasks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Completion */}
      {stats?.totalTasks && stats.totalTasks > 0 && (
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400">Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Completion Rate</span>
                <span className="text-white font-medium">
                  {Math.round(
                    ((stats.completedTasks || 0) / stats.totalTasks) * 100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-[#18181b] rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((stats.completedTasks || 0) / stats.totalTasks) * 100
                    }%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-md">
                <span className="text-neutral-400">
                  {stats.completedTasks || 0} of {stats.totalTasks} tasks
                  completed
                </span>
                <span className="text-neutral-400">
                  {stats.totalTasks - (stats.completedTasks || 0)} remaining
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Status */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400">Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#18181b] rounded border border-neutral-700">
            <div className="flex items-center gap-2">
              {user.is_active ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-white">Account Status</span>
            </div>
            <Badge
              variant={user.is_active ? "default" : "outline"}
              className={
                user.is_active
                  ? "bg-green-500 text-white"
                  : "border-yellow-500 text-yellow-400"
              }
            >
              {user.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#18181b] rounded border border-neutral-700">
            <div className="flex items-center gap-2">
              {user.is_first_login ? (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="text-white">First Login</span>
            </div>
            <Badge
              variant={user.is_first_login ? "outline" : "default"}
              className={
                user.is_first_login
                  ? "border-yellow-500 text-yellow-400"
                  : "bg-green-500 text-white"
              }
            >
              {user.is_first_login ? "Pending" : "Completed"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
