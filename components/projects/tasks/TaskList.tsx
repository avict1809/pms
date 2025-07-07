"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import TaskCard from "./TaskCard";
import CreateTaskForm from "./CreateTaskForm";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string;
  created_at: string;
  updated_at: string;
  assigned_to: {
    id: string;
    display_name: string;
    email: string;
  };
  created_by: {
    id: string;
    display_name: string;
    email: string;
  };
}

interface TaskListProps {
  projectId: string;
  userRole: string;
}

export default function TaskList({ projectId, userRole }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "todo" | "in_progress" | "completed"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      const data = await response.json();

      if (data.error) {
        setError("Failed to fetch tasks");
      } else {
        setTasks(data.data || []);
      }
    } catch (err) {
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "border-yellow-500 text-yellow-400";
      case "in_progress":
        return "border-blue-500 text-blue-400";
      case "completed":
        return "border-green-500 text-green-400";
      default:
        return "border-neutral-500 text-neutral-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 text-red-400";
      case "medium":
        return "border-orange-500 text-orange-400";
      case "low":
        return "border-green-500 text-green-400";
      default:
        return "border-neutral-500 text-neutral-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "all" || task.status === filter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const canCreateTask = userRole === "admin" || userRole === "supervisor";

  if (loading) {
    return (
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-neutral-400 mt-2">Loading tasks...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#23232a] border-red-500 shadow-lg">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium text-white mb-2">
            Error Loading Tasks
          </h3>
          <p className="text-neutral-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Project Tasks
            </CardTitle>
            {canCreateTask && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Tasks</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <Button
                variant="outline"
                onClick={() =>
                  setViewMode(viewMode === "list" ? "kanban" : "list")
                }
                className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
              >
                {viewMode === "list" ? "Kanban" : "List"}
              </Button>
            </div>
          </div>

          {/* Task Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#18181b] border border-neutral-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {tasks.length}
              </div>
              <div className="text-sm text-neutral-400">Total Tasks</div>
            </div>
            <div className="bg-[#18181b] border border-neutral-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {tasks.filter((t) => t.status === "todo").length}
              </div>
              <div className="text-sm text-neutral-400">To Do</div>
            </div>
            <div className="bg-[#18181b] border border-neutral-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {tasks.filter((t) => t.status === "in_progress").length}
              </div>
              <div className="text-sm text-neutral-400">In Progress</div>
            </div>
            <div className="bg-[#18181b] border border-neutral-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {tasks.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-sm text-neutral-400">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Task Form */}
      {showCreateForm && (
        <CreateTaskForm
          projectId={projectId}
          onClose={() => setShowCreateForm(false)}
          onTaskCreated={() => {
            setShowCreateForm(false);
            fetchTasks();
          }}
        />
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardContent className="p-8 text-center">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Tasks Found
            </h3>
            <p className="text-neutral-400">
              {searchTerm || filter !== "all"
                ? "No tasks match your current filters."
                : "No tasks have been created for this project yet."}
            </p>
            {canCreateTask && !showCreateForm && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              userRole={userRole}
              onTaskUpdated={fetchTasks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
