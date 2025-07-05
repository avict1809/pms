"use client";
import React from "react";
// TODO: Replace with actual user/role context
const role = "admin"; // placeholder

const navLinks = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: "🏠" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Projects", href: "/admin/projects", icon: "📁" },
    { label: "Proposals", href: "/admin/proposals", icon: "📝" },
    { label: "Finance", href: "/admin/finance", icon: "💰" },
    { label: "Announcements", href: "/admin/announcements", icon: "📢" },
    { label: "Requests", href: "/admin/requests", icon: "✅" },
    { label: "Tools", href: "/admin/tools", icon: "🛠️" },
  ],
  supervisor: [
    { label: "Dashboard", href: "/supervisor", icon: "🏠" },
    { label: "Projects", href: "/supervisor/projects", icon: "📁" },
    { label: "Requests", href: "/supervisor/requests", icon: "✅" },
  ],
  student: [
    { label: "Dashboard", href: "/student", icon: "🏠" },
    { label: "Propose Project", href: "/student/propose", icon: "➕" },
  ],
};

export default function Sidebar() {
  const links = navLinks[role as keyof typeof navLinks] || [];
  return (
    <aside className="w-64 bg-[#23232a] border-r border-orange-500 flex flex-col py-8 px-4 shadow-lg">
      <div className="mb-10 text-2xl font-extrabold text-orange-400 tracking-widest text-center">
        PMS
      </div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-orange-900/30 transition text-orange-200 hover:text-orange-400 font-semibold"
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </nav>
      <div className="mt-auto text-xs text-gray-500 text-center pt-8">
        Cyberpunk UI &copy; 2024
      </div>
    </aside>
  );
}
