"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useSupabase } from "@/supabase/context";
import { toast } from "react-hot-toast";

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const links = navLinks[role as keyof typeof navLinks] || [];
  const { supabase, user } = useSupabase();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Error logging out. Please try again.");
        console.error("Logout error:", error);
        return;
      }

      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Error logging out. Please try again.");
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={`${
        sidebarCollapsed ? "w-20" : "w-80"
      } bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-screen ${
        !sidebarCollapsed ? "md:block" : ""
      }`}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-10">
          <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
            <h1 className="text-orange-500 font-bold text-xl tracking-wider">
              Project MS
            </h1>
            <p className="text-neutral-500 text-sm">v1.0</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-neutral-400 hover:text-orange-500"
          >
            <ChevronRight
              className={`w-5 h-5 transition-transform ${
                sidebarCollapsed ? "" : "rotate-180"
              }`}
            />
          </Button>
        </div>

        <nav className="space-y-3 flex-1">
          {links.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors justify-start text-base ${
                activeSection === item.id
                  ? "bg-orange-500 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
              onClick={() => setActiveSection(item.id)}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="w-6 h-6" />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Profile/Logout section */}
        {!sidebarCollapsed && (
          <div className="mb-6 mt-8 flex flex-col gap-3">
            <div className="px-4 py-3 bg-neutral-800 rounded-lg">
              <div className="text-sm text-neutral-400 mb-1">Logged in as</div>
              <div className="text-white font-medium truncate">
                {user?.email || "Unknown User"}
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors justify-start text-neutral-400 hover:text-white hover:bg-neutral-800 text-base"
              asChild
            >
              <Link href="/profile">
                <User className="w-6 h-6" />
                <span className="font-medium">Profile/Settings</span>
              </Link>
            </Button>

            <Button
              variant="destructive"
              className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors justify-start font-medium text-base"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="w-6 h-6" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          </div>
        )}

        {/* Collapsed logout button */}
        {sidebarCollapsed && (
          <div className="mb-6 mt-8">
            <Button
              variant="destructive"
              size="icon"
              className="w-full p-4 rounded-lg"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
