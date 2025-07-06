"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FilePlus2,
  DollarSign,
  Megaphone,
  ClipboardList,
  Wrench,
  Settings,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";
// TODO: Replace with actual user/role context
const role = "admin"; // placeholder

const navLinks = {
  admin: [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin",
    },
    { id: "users", icon: Users, label: "Users", href: "/admin/users" },
    {
      id: "projects",
      icon: FolderKanban,
      label: "Projects",
      href: "/admin/projects",
    },
    {
      id: "proposals",
      icon: FilePlus2,
      label: "Proposals",
      href: "/admin/proposals",
    },
    {
      id: "finance",
      icon: DollarSign,
      label: "Finance",
      href: "/admin/finance",
    },
    {
      id: "announcements",
      icon: Megaphone,
      label: "Announcements",
      href: "/admin/announcements",
    },
    {
      id: "requests",
      icon: ClipboardList,
      label: "Requests",
      href: "/admin/requests",
    },
    { id: "tools", icon: Wrench, label: "Tools", href: "/admin/tools" },
    {
      id: "settings",
      icon: Settings,
      label: "System Settings",
      href: "/admin/settings",
    },
  ],
  supervisor: [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/supervisor",
    },
    {
      id: "projects",
      icon: FolderKanban,
      label: "Assigned Projects",
      href: "/supervisor/projects",
    },
    {
      id: "requests",
      icon: ClipboardList,
      label: "Requests",
      href: "/supervisor/requests",
    },
    {
      id: "announcements",
      icon: Megaphone,
      label: "Announcements",
      href: "/supervisor/announcements",
    },
    { id: "profile", icon: User, label: "Profile/Settings", href: "/profile" },
  ],
  student: [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/student",
    },
    {
      id: "projects",
      icon: FolderKanban,
      label: "My Projects",
      href: "/student/projects",
    },
    {
      id: "propose",
      icon: FilePlus2,
      label: "Propose Project",
      href: "/student/propose",
    },
    {
      id: "requests",
      icon: ClipboardList,
      label: "Requests",
      href: "/student/requests",
    },
    {
      id: "announcements",
      icon: Megaphone,
      label: "Announcements",
      href: "/student/announcements",
    },
    { id: "profile", icon: User, label: "Profile/Settings", href: "/profile" },
  ],
};

export default function Sidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const links = navLinks[role as keyof typeof navLinks] || [];

  return (
    <div
      className={`$${
        sidebarCollapsed ? "w-16" : "w-72"
      } bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-screen ${
        !sidebarCollapsed ? "md:block" : ""
      }`}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
            <h1 className="text-orange-500 font-bold text-lg tracking-wider">
              Project MS
            </h1>
            <p className="text-neutral-500 text-xs">v1.0</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-neutral-400 hover:text-orange-500"
          >
            <ChevronRight
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                sidebarCollapsed ? "" : "rotate-180"
              }`}
            />
          </Button>
        </div>

        <nav className="space-y-2 flex-1">
          {links.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full flex items-center gap-3 p-3 rounded transition-colors justify-start ${
                activeSection === item.id
                  ? "bg-orange-500 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
              onClick={() => setActiveSection(item.id)}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Profile/Logout section */}
        {!sidebarCollapsed && (
          <div className="mb-4 mt-6 flex flex-col gap-2">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 p-3 rounded transition-colors justify-start text-neutral-400 hover:text-white hover:bg-neutral-800"
              asChild
            >
              <Link href="/profile">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Profile/Settings</span>
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="w-full flex items-center gap-3 p-3 rounded transition-colors justify-start font-bold"
              onClick={() => {
                /* TODO: Implement logout */
              }}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
