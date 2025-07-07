"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Shield,
  Calendar,
  Activity,
  Settings,
  FileText,
  FolderKanban,
  DollarSign,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import EditUserDialog from "@/components/admin/EditUserDialog";
import { useDeleteUser, useUpdateUser } from "@/hooks/useUsers";
import { toast } from "react-hot-toast";

interface UserDetails {
  id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  is_first_login: boolean;
  created_at: string;
  updated_at: string;
  password_set_at?: string;
  created_by?: string;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Mutations
  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useUpdateUser();

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user details");
      }

      setUser(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load user details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleUserUpdate = async (userId: string, updates: any) => {
    try {
      await updateUserMutation.mutateAsync({ id: userId, userData: updates });
      toast.success("User updated successfully");
      fetchUserDetails(); // Refresh user data
      setShowEditDialog(false);
    } catch (error) {
      toast.error("Failed to update user");
      console.error("Error updating user:", error);
    }
  };

  const handleUserDelete = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.success("User deleted successfully");
      router.push("/admin/users");
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Error deleting user:", error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-5 h-5" />;
      case "supervisor":
        return <Users className="w-5 h-5" />;
      case "student":
        return <User className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 text-white";
      case "supervisor":
        return "bg-blue-500 text-white";
      case "student":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
            <span className="text-orange-400">Loading user details...</span>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !user) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/users")}
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </div>
          <Card className="bg-[#23232a] border-red-500 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-400 mb-2">User Not Found</h2>
                <p className="text-gray-400 mb-4">
                  {error || "The requested user could not be found."}
                </p>
                <Button onClick={() => router.push("/admin/users")}>
                  Return to Users
                </Button>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/users")}
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
            <div className="flex items-center gap-3">
              <Users className="text-orange-500 w-7 h-7" />
              <h1 className="text-2xl font-bold text-orange-400 tracking-wider">
                User Details
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(true)}
              className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </Button>
          </div>
        </div>

        {/* User Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main User Info */}
          <Card className="bg-[#23232a] border-orange-500 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{user.display_name}</h2>
                  <p className="text-gray-400">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </Badge>
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
                    {user.is_first_login && (
                      <Badge
                        variant="outline"
                        className="border-yellow-500 text-yellow-400"
                      >
                        First Login Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Role:</span>
                    <span className="text-white font-medium capitalize">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-medium ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Updated:</span>
                    <span className="text-white font-medium">
                      {new Date(user.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {user.password_set_at && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Password Set:</span>
                      <span className="text-white font-medium">
                        {new Date(user.password_set_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-neutral-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <FolderKanban className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Projects</span>
                </div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-xs text-gray-400">Assigned projects</div>
              </div>

              <div className="p-4 bg-neutral-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Tasks</span>
                </div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-xs text-gray-400">Assigned tasks</div>
              </div>

              <div className="p-4 bg-neutral-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-medium">Notifications</span>
                </div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-xs text-gray-400">Unread notifications</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Future Sections - Placeholder for upcoming features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Timeline - Placeholder */}
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Activity timeline coming soon...</p>
              </div>
            </CardContent>
          </Card>

          {/* Project History - Placeholder */}
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <FolderKanban className="w-5 h-5" />
                Project History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FolderKanban className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Project history coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <DeleteUserDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={() => handleUserDelete(user.id)}
          user={user}
          isLoading={deleteUserMutation.isPending}
        />

        <EditUserDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSave={handleUserUpdate}
          user={user}
          isLoading={updateUserMutation.isPending}
        />
      </div>
    </AuthGuard>
  );
} 