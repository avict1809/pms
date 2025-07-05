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
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import AddUserForm from "@/components/admin/AddUserForm";
import BulkUploadUsers from "@/components/admin/BulkUploadUsers";
import UserActivationManager from "@/components/admin/UserActivationManager";

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    email: "admin@pms.com",
    displayName: "System Administrator",
    role: "admin",
    isActive: true,
    isFirstLogin: false,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    email: "supervisor1@pms.com",
    displayName: "Dr. Sarah Johnson",
    role: "supervisor",
    isActive: true,
    isFirstLogin: false,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    email: "student1@pms.com",
    displayName: "Alex Chen",
    role: "student",
    isActive: true,
    isFirstLogin: false,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    email: "student2@pms.com",
    displayName: "Maria Garcia",
    role: "student",
    isActive: false,
    isFirstLogin: true,
    createdAt: "2024-02-05",
  },
  {
    id: "5",
    email: "supervisor2@pms.com",
    displayName: "Prof. Michael Brown",
    role: "supervisor",
    isActive: true,
    isFirstLogin: false,
    createdAt: "2024-01-25",
  },
];

export default function AdminUsersPage() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showActivationManager, setShowActivationManager] = useState(false);
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddUser = (userData: any) => {
    const newUser = {
      id: (users.length + 1).toString(),
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      isActive: userData.isActive,
      isFirstLogin: true,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, newUser]);
  };

  const handleBulkUpload = async (usersData: any[]) => {
    const newUsers = usersData.map((userData, index) => ({
      id: (users.length + index + 1).toString(),
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      isActive: userData.isActive,
      isFirstLogin: true,
      createdAt: new Date().toISOString().split("T")[0],
    }));
    setUsers([...users, ...newUsers]);
  };

  const handleUserUpdate = (userId: string, updates: any) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      )
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className="text-2xl font-bold text-white">5</div>
              <div className="text-xs text-neutral-400">Total Users</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">2</div>
              <div className="text-xs text-neutral-400">Supervisors</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">2</div>
              <div className="text-xs text-neutral-400">Students</div>
            </CardContent>
          </Card>
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">1</div>
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
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400">All Users</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-neutral-800 hover:bg-neutral-800/50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">
                            {user.displayName}
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
                          variant={user.isActive ? "default" : "destructive"}
                          className={
                            user.isActive
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            user.isFirstLogin
                              ? "border-yellow-500 text-yellow-400"
                              : "border-green-500 text-green-400"
                          }
                        >
                          {user.isFirstLogin ? "Pending" : "Completed"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-neutral-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
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
                            className="text-neutral-400 hover:text-white"
                          >
                            {user.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserForm
          onClose={() => setShowAddUser(false)}
          onSubmit={handleAddUser}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadUsers
          onClose={() => setShowBulkUpload(false)}
          onUpload={handleBulkUpload}
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
