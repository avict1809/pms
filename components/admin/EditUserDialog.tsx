"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Save, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, userData: any) => Promise<void>;
  user: {
    id: string;
    email: string;
    display_name: string;
    role: string;
    is_active: boolean;
    is_first_login: boolean;
  } | null;
  isLoading?: boolean;
}

export default function EditUserDialog({
  isOpen,
  onClose,
  onSave,
  user,
  isLoading = false,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    display_name: "",
    email: "",
    role: "",
    is_active: false,
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || "",
        email: user.email || "",
        role: user.role || "",
        is_active: user.is_active || false,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate form
    if (!formData.display_name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await onSave(user.id, formData);
      toast.success("User updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update user");
      console.error("Error updating user:", error);
    }
  };

  const handleClose = () => {
    // Reset form to original values
    if (user) {
      setFormData({
        display_name: user.display_name || "",
        email: user.email || "",
        role: user.role || "",
        is_active: user.is_active || false,
      });
    }
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#23232a] border-orange-500 shadow-lg max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-orange-400">
                Edit User
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Update user information and settings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Status Info */}
          <div className="p-4 bg-neutral-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-medium">
                Current Status
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
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
                className={
                  user.is_first_login
                    ? "border-yellow-500 text-yellow-400"
                    : "border-green-500 text-green-400"
                }
              >
                {user.is_first_login ? "First Login Pending" : "Password Set"}
              </Badge>
              <Badge
                variant="outline"
                className="border-blue-500 text-blue-400 capitalize"
              >
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name *
              </label>
              <Input
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                placeholder="Enter display name"
                className="bg-[#18181b] border-gray-700 text-white placeholder-gray-400 focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
                className="bg-[#18181b] border-gray-700 text-white placeholder-gray-400 focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="bg-[#18181b] border-gray-700 text-white focus:border-orange-400">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-[#18181b] border-gray-700">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Status
              </label>
              <Select
                value={formData.is_active.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, is_active: value === "true" })
                }
              >
                <SelectTrigger className="bg-[#18181b] border-gray-700 text-white focus:border-orange-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#18181b] border-gray-700">
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Warning for first-time users */}
          {user.is_first_login && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div className="text-sm">
                  <p className="text-yellow-400 font-medium mb-1">
                    First-Time User
                  </p>
                  <p className="text-yellow-300">
                    This user has not set up their password yet. They will be
                    prompted to set up their password on their first login.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
