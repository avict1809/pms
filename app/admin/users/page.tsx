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
  User,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import AddUserForm from "@/components/admin/AddUserForm";
import BulkUploadUsers from "@/components/admin/BulkUploadUsers";
import UserActivationManager from "@/components/admin/UserActivationManager";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import EditUserDialog from "@/components/admin/EditUserDialog";
import { useUsers, useUpdateUser, useDeleteUser } from "@/hooks/useUsers";
import type { User } from "@/hooks/useUsers";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showActivationManager, setShowActivationManager] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });

  // Data fetching hooks
  const { data: users = [], isLoading, error, refetch } = useUsers();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const router = useRouter();

  const handleUserUpdate = async (userId: string, updates: any) => {
    try {
      await updateUserMutation.mutateAsync({ id: userId, userData: updates });
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleUserDelete = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      setDeleteDialog({ isOpen: false, user: null });
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openDeleteDialog = (user: User) => {
    setDeleteDialog({ isOpen: true, user });
  };

  const openEditDialog = (user: User) => {
    setEditDialog({ isOpen: true, user });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, user: null });
  };

  const closeEditDialog = () => {
    setEditDialog({ isOpen: false, user: null });
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

        {/* Users List */}
        <div className="max-h-[500px] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user: User) => (
              <Card
                key={user.id}
                className="bg-[#23232a] border-orange-500 shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">
                        {user.display_name}
                      </CardTitle>
                      <CardContent className="p-0 mt-2">
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </CardContent>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="border-blue-600 text-blue-400 hover:text-white hover:bg-blue-600"
                      >
                        <User className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        className="border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(user)}
                        className="border-red-600 text-red-400 hover:text-white hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
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
                    <Badge
                      variant="outline"
                      className="border-orange-500 text-orange-400 capitalize"
                    >
                      {user.role}
                    </Badge>
                    {user.is_first_login && (
                      <Badge
                        variant="outline"
                        className="border-yellow-500 text-yellow-400"
                      >
                        First Login
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dialogs */}
        <DeleteUserDialog
          isOpen={deleteDialog.isOpen}
          onClose={closeDeleteDialog}
          onConfirm={() =>
            deleteDialog.user && handleUserDelete(deleteDialog.user.id)
          }
          user={deleteDialog.user}
          isLoading={deleteUserMutation.isPending}
        />

        <EditUserDialog
          isOpen={editDialog.isOpen}
          onClose={closeEditDialog}
          onSave={handleUserUpdate}
          user={editDialog.user}
          isLoading={updateUserMutation.isPending}
        />

        {/* Other Modals */}
        {showAddUser && (
          <AddUserForm
            onClose={() => setShowAddUser(false)}
            onSuccess={() => {
              setShowAddUser(false);
              refetch();
            }}
          />
        )}

        {showBulkUpload && (
          <BulkUploadUsers
            onClose={() => setShowBulkUpload(false)}
            onSuccess={() => {
              setShowBulkUpload(false);
              refetch();
            }}
          />
        )}

        {showActivationManager && (
          <UserActivationManager
            onClose={() => setShowActivationManager(false)}
            onSuccess={() => {
              setShowActivationManager(false);
              refetch();
            }}
          />
        )}
      </div>
    </AuthGuard>
  );
}
