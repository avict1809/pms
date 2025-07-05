"use client";
import React, { useState } from "react";
import { signIn } from "../../lib/auth";

export default function SignInForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error.message);
    else if (onSuccess) onSuccess();
  };

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
          className="w-full px-4 py-2 rounded bg-[#23232a] text-white border border-gray-700 focus:border-orange-400 outline-none"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 rounded bg-[#23232a] text-white border border-gray-700 focus:border-orange-400 outline-none"
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
        className="w-full py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-widest transition"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
