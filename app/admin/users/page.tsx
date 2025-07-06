"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Upload,
  Loader2,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import AddUserForm from "@/components/admin/AddUserForm";
import BulkUploadUsers from "@/components/admin/BulkUploadUsers";
import UserActivationManager from "@/components/admin/UserActivationManager";
import { useUsers, useUpdateUser, useDeleteUser, User } from "@/hooks/useUsers";

export default function AdminUsersPage() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showActivationManager, setShowActivationManager] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Data fetching hooks
  const { data: users = [], isLoading, error, refetch } = useUsers();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleUserUpdate = async (userId: string, updates: any) => {
    try {
      await updateUserMutation.mutateAsync({ id: userId, userData: updates });
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserMutation.mutateAsync(userId);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    supervisors: users.filter((u: User) => u.role === "supervisor").length,
    students: users.filter((u: User) => u.role === "student").length,
    pendingActivation: users.filter((u: User) => !u.is_active).length,
  };

  if (error) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-orange-500 w-7 h-7" />
              <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
                User Management
              </h1>
            </div>
          </div>
          <Card className="bg-[#23232a] border-red-500 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-400 mb-4">Error loading users</p>
                <Button onClick={() => refetch()}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-orange-500 w-7 h-7" />
            <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
              User Management
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowActivationManager(true)}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Manage Activation
            </Button>
            <Button onClick={() => setShowAddUser(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">
                {stats.totalUsers}
              </div>
              <div className="text-xs text-neutral-400">Total Users</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">
                {stats.supervisors}
              </div>
              <div className="text-xs text-neutral-400">Supervisors</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">
                {stats.students}
              </div>
              <div className="text-xs text-neutral-400">Students</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">
                {stats.pendingActivation}
              </div>
              <div className="text-xs text-neutral-400">Pending Activation</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white focus:border-orange-400 outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="student">Student</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white focus:border-orange-400 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400">All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        First Login
                      </th>
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        Created
                      </th>
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: User) => (
                      <tr
                        key={user.id}
                        className="border-b border-neutral-800 hover:bg-neutral-800/50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-white">
                              {user.display_name}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              user.role === "admin"
                                ? "default"
                                : user.role === "supervisor"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              user.role === "admin"
                                ? "bg-red-500 text-white"
                                : user.role === "supervisor"
                                ? "bg-blue-500 text-white"
                                : "border-green-500 text-green-400"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={user.is_active ? "default" : "destructive"}
                            className={
                              user.is_active
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              user.is_first_login
                                ? "border-yellow-500 text-yellow-400"
                                : "border-green-500 text-green-400"
                            }
                          >
                            {user.is_first_login ? "Pending" : "Completed"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-neutral-400 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-neutral-400 hover:text-white"
                              onClick={() =>
                                handleUserUpdate(user.id, {
                                  is_active: !user.is_active,
                                })
                              }
                              disabled={updateUserMutation.isPending}
                            >
                              {user.is_active ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-neutral-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleUserDelete(user.id)}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-neutral-400">
                    No users found matching your criteria
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      {showAddUser && <AddUserForm onClose={() => setShowAddUser(false)} />}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadUsers
          onClose={() => setShowBulkUpload(false)}
          onUpload={() => {
            setShowBulkUpload(false);
            refetch();
          }}
        />
      )}

      {/* User Activation Manager Modal */}
      {showActivationManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#23232a] border border-orange-500 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <UserActivationManager
                users={users}
                onUserUpdate={handleUserUpdate}
              />
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowActivationManager(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
