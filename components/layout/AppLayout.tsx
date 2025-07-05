"use client";
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#18181b] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gradient-to-br from-[#18181b] via-[#23232a] to-black">
          {children}
        </main>
      </div>
    </div>
  );
}
