"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  BarChart3,
  Calendar,
  MessageSquare,
  Target,
  Award,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function SupervisorToolsPage() {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log("Report generated successfully");
    } catch (error) {
      console.error("Report generation failed:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleScheduleMeeting = async () => {
    setIsSchedulingMeeting(true);
    try {
      // Simulate meeting scheduling
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Meeting scheduled successfully");
    } catch (error) {
      console.error("Meeting scheduling failed:", error);
    } finally {
      setIsSchedulingMeeting(false);
    }
  };

  const teamStats = {
    totalStudents: 12,
    activeProjects: 8,
    completedProjects: 15,
    averageProgress: 75,
  };

  const recentActivities = [
    {
      id: 1,
      type: "project_update",
      message: "Project Alpha updated by John Doe",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "task_completed",
      message: "Task completed in Project Beta",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "new_request",
      message: "New approval request from Jane Smith",
      time: "6 hours ago",
    },
    {
      id: 4,
      type: "milestone",
      message: "Milestone reached in Project Gamma",
      time: "1 day ago",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "project_update":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "task_completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "new_request":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "milestone":
        return <Award className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supervisor Tools</h1>
        <p className="text-muted-foreground">
          Project management and team supervision utilities
        </p>
      </div>

      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Overview
          </CardTitle>
          <CardDescription>
            Current team statistics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {teamStats.totalStudents}
              </div>
              <p className="text-md text-muted-foreground">Total Students</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {teamStats.activeProjects}
              </div>
              <p className="text-md text-muted-foreground">Active Projects</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {teamStats.completedProjects}
              </div>
              <p className="text-md text-muted-foreground">
                Completed Projects
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {teamStats.averageProgress}%
              </div>
              <p className="text-md text-muted-foreground">Average Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reports & Analytics
            </CardTitle>
            <CardDescription>
              Generate reports and analyze project performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-md font-medium">Report Types:</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-md">Project Progress Report</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-md">Student Performance Report</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-md">Financial Summary</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-md">Timeline Analysis</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-md font-medium">Date Range:</label>
              <select className="w-full p-2 border rounded-md">
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last 6 months</option>
                <option>Last year</option>
                <option>Custom range</option>
              </select>
            </div>
            <Button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="w-full"
            >
              {isGeneratingReport ? (
                <>
                  <BarChart3 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meeting Scheduler
            </CardTitle>
            <CardDescription>
              Schedule team meetings and review sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-md font-medium">Meeting Type:</label>
              <select className="w-full p-2 border rounded-md">
                <option>Project Review</option>
                <option>Progress Check-in</option>
                <option>Team Building</option>
                <option>Problem Solving</option>
                <option>Milestone Celebration</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-md font-medium">Duration:</label>
              <select className="w-full p-2 border rounded-md">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>1.5 hours</option>
                <option>2 hours</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-md font-medium">Participants:</label>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-md">All team members</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-md">Project leads only</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-md">Individual meetings</span>
                </label>
              </div>
            </div>
            <Button
              onClick={handleScheduleMeeting}
              disabled={isSchedulingMeeting}
              className="w-full"
            >
              {isSchedulingMeeting ? (
                <>
                  <Calendar className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used supervisor functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <Users className="h-5 w-5" />
              <span>Team Management</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <Target className="h-5 w-5" />
              <span>Set Milestones</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Send Announcements</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Performance Review</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Latest updates from your team and projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-md font-medium">{activity.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Key performance indicators for your supervision
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">92%</div>
              <p className="text-md text-muted-foreground">
                On-time Completion
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "92%" }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4.2/5</div>
              <p className="text-md text-muted-foreground">
                Student Satisfaction
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "84%" }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">87%</div>
              <p className="text-md text-muted-foreground">Quality Score</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: "87%" }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
