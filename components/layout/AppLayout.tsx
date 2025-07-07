"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we're on an exhemted page
  const isExhemtedPage =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/first-time-setup") ||
    pathname?.startsWith("/project/");

  // If it's an auth page, render without sidebar - let the auth page handle its own layout
  if (isExhemtedPage) {
    return <>{children}</>;
  }

  // Otherwise, render with sidebar
  return (
    <div className="flex h-screen bg-[#18181b] text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-6 bg-gradient-to-br from-[#18181b] via-[#23232a] to-black overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
