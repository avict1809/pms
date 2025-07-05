"use client";
import React from "react";
// TODO: Replace with actual user context
const user = { displayName: "Admin User", role: "admin" };

export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-[#23232a] border-b border-orange-500 shadow">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-orange-700 flex items-center justify-center text-xl font-bold text-white">
          A
        </div>
        <div>
          <div className="font-bold text-orange-400">{user.displayName}</div>
          <div className="text-xs text-gray-400 uppercase tracking-widest">
            {user.role}
          </div>
        </div>
      </div>
      <button className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-widest transition">
        Logout
      </button>
    </header>
  );
}
