"use client";
import React, { useState } from "react";
import { setFirstTimePassword } from "../../lib/auth";

export default function FirstTimePasswordSetup({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess?: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await setFirstTimePassword(email, password);
    setLoading(false);
    if (error) setError(error.message);
    else if (onSuccess) onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#18181b] p-8 rounded-lg shadow-lg max-w-md w-full mx-auto border border-cyan-500"
    >
      <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center tracking-widest">
        Set Your Password
      </h2>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 rounded bg-[#23232a] text-white border border-gray-700 focus:border-cyan-400 outline-none"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full px-4 py-2 rounded bg-[#23232a] text-white border border-gray-700 focus:border-cyan-400 outline-none"
        />
      </div>
      {error && (
        <div className="mb-4 text-red-500 font-semibold text-center">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded bg-cyan-500 hover:bg-cyan-600 text-white font-bold tracking-widest transition"
      >
        {loading ? "Setting..." : "Set Password"}
      </button>
    </form>
  );
}
