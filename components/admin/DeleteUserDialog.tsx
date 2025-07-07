"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, User, Trash2 } from "lucide-react";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: {
    id: string;
    email: string;
    display_name: string;
    role: string;
  } | null;
  isLoading?: boolean;
}

export default function DeleteUserDialog({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading = false,
}: DeleteUserDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#23232a] border-orange-500 shadow-lg max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-red-400">
                Delete User
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">User Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Name:</span>
                <span className="text-white ml-2 font-medium">
                  {user.display_name}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <span className="text-white ml-2 font-medium">
                  {user.email}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Role:</span>
                <span className="text-white ml-2 font-medium capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-orange-400 font-medium mb-1">Warning</p>
                <p className="text-orange-300">
                  Deleting this user will permanently remove their account and
                  all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
