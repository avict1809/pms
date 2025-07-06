"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "../../lib/auth";
import { supabase } from "../../supabase/client";
import FirstTimePasswordSetup from "./FirstTimePasswordSetup";
import { toast } from "react-hot-toast";

export default function SignInForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [showFirstTimeSetup, setShowFirstTimeSetup] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  const checkUserStatus = async (email: string) => {
    setCheckingUser(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "User not found");
        setCheckingUser(false);
        return null;
      }

      setUserData(data.user);

      // If user exists and is active, try to sign in
      const { data: authData, error: authError } = await signIn(
        email,
        password
      );

      if (authError) {
        // Only show first-time setup if user actually needs it
        if (
          data.user.is_first_login &&
          (authError.message.includes("Invalid login credentials") ||
            authError.message.includes("Email not confirmed") ||
            authError.message.includes("User not found"))
        ) {
          // This is a first-time user who needs to set up password
          setShowFirstTimeSetup(true);
          setCheckingUser(false);
          return null;
        } else {
          // Regular authentication error (wrong password, etc.)
          setError(authError.message);
          setCheckingUser(false);
          return null;
        }
      }

      // Successful login
      setCheckingUser(false);

      // Get user role from database
      const { data: userRoleData } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      // Redirect based on role
      if (userRoleData?.role === "admin") {
        router.push("/admin");
      } else if (userRoleData?.role === "supervisor") {
        router.push("/supervisor");
      } else if (userRoleData?.role === "student") {
        router.push("/student");
      } else {
        router.push("/");
      }

      if (onSuccess) onSuccess();
      return authData;
    } catch (error) {
      console.error("Error checking user:", error);
      setError("An error occurred. Please try again.");
      setCheckingUser(false);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    await checkUserStatus(email);
  };

  const handleBackToLogin = () => {
    setShowFirstTimeSetup(false);
    setUserData(null);
    setError(null);
    setPassword("");
  };

  // Show first-time password setup if needed
  if (showFirstTimeSetup && userData) {
    return (
      <FirstTimePasswordSetup
        email={email}
        displayName={userData.display_name}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#18181b] p-8 rounded-lg shadow-lg max-w-md w-full mx-auto border border-orange-500"
    >
      <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center tracking-widest">
        Sign In
      </h2>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={checkingUser}
          className="w-full px-4 py-2 rounded bg-[#23232a] text-white border border-gray-700 focus:border-orange-400 outline-none disabled:opacity-50"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={checkingUser}
          className="w-full px-4 py-2 rounded bg-[#23232a] text-white border border-gray-700 focus:border-orange-400 outline-none disabled:opacity-50"
        />
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={checkingUser}
        className="w-full py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-widest transition-colors disabled:opacity-50"
      >
        {checkingUser ? "Checking..." : "Sign In"}
      </button>

      <div className="mt-4 text-center">
        <Link
          href="/forgot-password"
          className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
        >
          Forgot your password?
        </Link>
      </div>

      {/* First-time login info */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="text-blue-400 font-medium text-sm mb-1">
              First-Time Login?
            </h4>
            <p className="text-blue-300 text-xs">
              If your account was created by an administrator, you'll be
              prompted to set up your password on first login.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
