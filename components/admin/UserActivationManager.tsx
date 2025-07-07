"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  UserX,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { User } from "@/hooks/useUsers";

interface UserActivationManagerProps {
  users: User[];
  onUserUpdate: (userId: string, updates: any) => void;
}

export default function UserActivationManager({
  users,
  onUserUpdate,
}: UserActivationManagerProps) {
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const pendingUsers = users.filter((user) => !user.is_active);
  const activeUsers = users.filter((user) => user.is_active);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === pendingUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(pendingUsers.map((user) => user.id));
    }
  };

  const handleBulkAction = () => {
    if (selectedAction === "activate") {
      selectedUsers.forEach((userId) => {
        onUserUpdate(userId, { is_active: true });
      });
    } else if (selectedAction === "deactivate") {
      selectedUsers.forEach((userId) => {
        onUserUpdate(userId, { is_active: false });
      });
    }
    setSelectedUsers([]);
    setSelectedAction("");
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {pendingUsers.length}
                </div>
                <div className="text-sm text-neutral-400">
                  Pending Activation
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {activeUsers.length}
                </div>
                <div className="text-sm text-neutral-400">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {users.length}
                </div>
                <div className="text-sm text-neutral-400">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {pendingUsers.length > 0 && (
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Bulk Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === pendingUsers.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-orange-500 bg-[#18181b] border-neutral-700 rounded focus:ring-orange-400"
                />
                <span className="text-neutral-400 text-md">
                  Select All ({selectedUsers.length}/{pendingUsers.length})
                </span>
              </div>

              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-3 py-2 bg-[#18181b] border border-neutral-700 rounded text-white focus:border-orange-400 outline-none"
              >
                <option value="">Choose Action</option>
                <option value="activate">Activate Selected</option>
                <option value="deactivate">Deactivate Selected</option>
              </select>

              <Button
                onClick={handleBulkAction}
                disabled={!selectedAction || selectedUsers.length === 0}
                className={
                  selectedAction === "activate"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }
              >
                {selectedAction === "activate" ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate
                  </>
                ) : selectedAction === "deactivate" ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  "Apply Action"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Users */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Activation ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>All users are activated!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-[#18181b] rounded border border-neutral-700"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-4 h-4 text-orange-500 bg-[#18181b] border-neutral-700 rounded focus:ring-orange-400"
                    />
                    <div>
                      <div className="font-medium text-white">
                        {user.display_name}
                      </div>
                      <div className="text-md text-neutral-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="border-blue-500 text-blue-400"
                    >
                      {user.role}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => onUserUpdate(user.id, { is_active: true })}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Active Users ({activeUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-[#18181b] rounded border border-neutral-700"
              >
                <div>
                  <div className="font-medium text-white">
                    {user.display_name}
                  </div>
                  <div className="text-md text-neutral-400">{user.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="border-blue-500 text-blue-400"
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      user.is_first_login
                        ? "border-yellow-500 text-yellow-400"
                        : "border-green-500 text-green-400"
                    }
                  >
                    {user.is_first_login
                      ? "First Login Pending"
                      : "Setup Complete"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUserUpdate(user.id, { is_active: false })}
                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    Deactivate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
