"use client";
import React, { useState } from "react";
import Link from "next/link";
import { sendPasswordReset } from "../../lib/auth";

export default function ForgotPasswordForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const { error } = await sendPasswordReset(email);
    setLoading(false);
    if (error) setError(error.message);
    else {
      setSuccess("Password reset email sent!");
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#18181b] p-8 rounded-lg shadow-lg max-w-md w-full mx-auto border border-purple-500"
    >
      <h2 className="text-2xl font-bold text-purple-400 mb-6 text-center tracking-widest">
        Forgot Password
      </h2>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 rounded bg-[#23232a] text-white border border-gray-700 focus:border-purple-400 outline-none"
        />
      </div>
      {error && (
        <div className="mb-4 text-red-500 font-semibold text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 text-green-400 font-semibold text-center">
          {success}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded bg-purple-500 hover:bg-purple-600 text-white font-bold tracking-widest transition-colors disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Reset Email"}
      </button>

      <div className="mt-4 text-center">
        <Link
          href="/login"
          className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
}
