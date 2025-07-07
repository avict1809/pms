"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, UserPlus, Mail, User, Shield } from "lucide-react";
import { useCreateUser, CreateUserData } from "@/hooks/useUsers";

interface AddUserFormProps {
  onClose: () => void;
}

export default function AddUserForm({ onClose }: AddUserFormProps) {
  const createUserMutation = useCreateUser();
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    display_name: "",
    role: "member",
    is_active: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUserMutation.mutateAsync(formData);
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Error creating user:", error);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-[#23232a] border-orange-500 shadow-lg w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New User
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  disabled={createUserMutation.isPending}
                  className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none disabled:opacity-50"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => handleChange("display_name", e.target.value)}
                  required
                  disabled={createUserMutation.isPending}
                  className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none disabled:opacity-50"
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <select
                  value={formData.role}
                  onChange={(e) =>
                    handleChange(
                      "role",
                      e.target.value as "admin" | "supervisor" | "member"
                    )
                  }
                  disabled={createUserMutation.isPending}
                  className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white focus:border-orange-400 outline-none disabled:opacity-50"
                >
                  <option value="member">Student</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
                disabled={createUserMutation.isPending}
                className="w-4 h-4 text-orange-500 bg-[#18181b] border-neutral-700 rounded focus:ring-orange-400 disabled:opacity-50"
              />
              <label htmlFor="isActive" className="text-gray-300 text-sm">
                Activate user immediately
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createUserMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="flex-1"
              >
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
