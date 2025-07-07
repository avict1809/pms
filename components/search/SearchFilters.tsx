"use client";
import { useState } from "react";
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
  Filter,
  X,
  Calendar,
  User,
  FolderOpen,
  ClipboardList,
  FileText,
  Megaphone,
  Users,
  RefreshCw,
} from "lucide-react";

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
  showTitle?: boolean;
}

export interface SearchFilters {
  type: string[];
  status: string[];
  dateRange: {
    start: string;
    end: string;
  };
  assignedTo: string;
  createdBy: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const defaultFilters: SearchFilters = {
  type: [],
  status: [],
  dateRange: {
    start: "",
    end: "",
  },
  assignedTo: "",
  createdBy: "",
  sortBy: "created_at",
  sortOrder: "desc",
};

export default function SearchFilters({
  onFiltersChange,
  className = "",
  showTitle = true,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.type.includes(type)
      ? filters.type.filter((t) => t !== type)
      : [...filters.type, type];
    handleFilterChange("type", newTypes);
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    handleFilterChange("status", newStatuses);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.type.length > 0 ||
      filters.status.length > 0 ||
      filters.dateRange.start ||
      filters.dateRange.end ||
      filters.assignedTo ||
      filters.createdBy ||
      filters.sortBy !== "created_at" ||
      filters.sortOrder !== "desc"
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type.length > 0) count += filters.type.length;
    if (filters.status.length > 0) count += filters.status.length;
    if (filters.dateRange.start) count += 1;
    if (filters.dateRange.end) count += 1;
    if (filters.assignedTo) count += 1;
    if (filters.createdBy) count += 1;
    return count;
  };

  return (
    <Card className={`bg-[#23232a] border-orange-500 shadow-lg ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          {showTitle && (
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search Filters
            </CardTitle>
          )}
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Badge
                variant="outline"
                className="border-orange-500 text-orange-400"
              >
                {getActiveFilterCount()} active
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-neutral-400 hover:text-white"
            >
              {isExpanded ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Type Filters */}
          <div>
            <h4 className="text-white font-medium mb-3">Content Type</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "project", label: "Projects", icon: FolderOpen },
                { value: "task", label: "Tasks", icon: ClipboardList },
                { value: "file", label: "Files", icon: FileText },
                {
                  value: "announcement",
                  label: "Announcements",
                  icon: Megaphone,
                },
                { value: "user", label: "Users", icon: Users },
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={filters.type.includes(value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTypeToggle(value)}
                  className={
                    filters.type.includes(value)
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                  }
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <h4 className="text-white font-medium mb-3">Status</h4>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  value: "pending",
                  label: "Pending",
                  color: "border-yellow-500 text-yellow-400",
                },
                {
                  value: "active",
                  label: "Active",
                  color: "border-green-500 text-green-400",
                },
                {
                  value: "completed",
                  label: "Completed",
                  color: "border-blue-500 text-blue-400",
                },
                {
                  value: "archived",
                  label: "Archived",
                  color: "border-gray-500 text-gray-400",
                },
              ].map(({ value, label, color }) => (
                <Button
                  key={value}
                  variant={
                    filters.status.includes(value) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleStatusToggle(value)}
                  className={
                    filters.status.includes(value)
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : `border-neutral-700 text-neutral-400 hover:bg-neutral-800 ${color}`
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-md text-neutral-400 mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    handleFilterChange("dateRange", {
                      ...filters.dateRange,
                      start: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-md text-neutral-400 mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) =>
                    handleFilterChange("dateRange", {
                      ...filters.dateRange,
                      end: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* User Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assigned To
              </h4>
              <input
                type="text"
                placeholder="Enter user name..."
                value={filters.assignedTo}
                onChange={(e) =>
                  handleFilterChange("assignedTo", e.target.value)
                }
                className="w-full px-3 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Created By
              </h4>
              <input
                type="text"
                placeholder="Enter user name..."
                value={filters.createdBy}
                onChange={(e) =>
                  handleFilterChange("createdBy", e.target.value)
                }
                className="w-full px-3 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <h4 className="text-white font-medium mb-3">Sort By</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger className="bg-[#18181b] border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#23232a] border-neutral-600">
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="updated_at">Updated Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) =>
                  handleFilterChange("sortOrder", value)
                }
              >
                <SelectTrigger className="bg-[#18181b] border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#23232a] border-neutral-600">
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!hasActiveFilters()}
              className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => onFiltersChange(filters)}
              className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
