"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, User, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

interface FirstTimePasswordSetupProps {
  email: string;
  displayName: string;
  onBack: () => void;
}

export default function FirstTimePasswordSetup({
  email,
  displayName,
  onBack,
}: FirstTimePasswordSetupProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/first-time-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to set up password");
        setLoading(false);
        return;
      }

      toast.success("Password set up successfully! You can now log in.");

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Error setting up password:", error);
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#18181b] p-8 rounded-lg shadow-lg max-w-md w-full mx-auto border border-orange-500">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-orange-400 tracking-widest">
          First-Time Setup
        </h2>
        <p className="text-neutral-400 mt-2">
          Welcome! Please set up your password to continue.
        </p>
      </div>

      <div className="mb-6 p-4 bg-neutral-800 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-4 h-4 text-neutral-400" />
          <span className="text-md text-neutral-400">User</span>
        </div>
        <div className="text-white font-medium">{displayName}</div>

        <div className="flex items-center gap-3 mt-3">
          <Mail className="w-4 h-4 text-neutral-400" />
          <span className="text-md text-neutral-400">Email</span>
        </div>
        <div className="text-white font-medium">{email}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2 text-md font-medium">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded bg-[#23232a] text-white border border-gray-700 focus:border-orange-400 outline-none pr-12"
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Password must be at least 8 characters long
          </p>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-md font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded bg-[#23232a] text-white border border-gray-700 focus:border-orange-400 outline-none pr-12"
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-widest transition-colors disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Set Password"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
            className="w-full py-3 rounded border-neutral-600 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            Back to Login
          </Button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-white text-sm font-bold">i</span>
          </div>
          <div>
            <h4 className="text-blue-400 font-medium text-md mb-1">
              First-Time Login
            </h4>
            <p className="text-blue-300 text-sm">
              Your account was created by an administrator. This is your first
              login, so you need to set up your password to access the system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
