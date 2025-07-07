"use client";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  FolderKanban,
  FileText,
  ClipboardList,
  Users,
  Settings,
  AlertCircle,
  TrendingUp,
  LayoutDashboard,
  Bell,
} from "lucide-react";

const navItems = [
  {
    key: "dashboard",
    label: "DASHBOARD",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  { key: "files", label: "FILES", icon: <FileText className="w-5 h-5" /> },
  { key: "tasks", label: "TASKS", icon: <ClipboardList className="w-5 h-5" /> },
  {
    key: "finance",
    label: "FINANCE",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  { key: "members", label: "MEMBERS", icon: <Users className="w-5 h-5" /> },
  {
    key: "requests",
    label: "REQUESTS",
    icon: <AlertCircle className="w-5 h-5" />,
  },
  {
    key: "announcements",
    label: "ANNOUNCEMENTS",
    icon: <Bell className="w-5 h-5" />,
  },
  {
    key: "settings",
    label: "SETTINGS",
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id;
  return (
    <div className="flex min-h-screen bg-[#18181b]">
      <aside className="w-56 bg-[#23232a] border-r border-orange-500 flex flex-col py-8 px-4">
        <div className="mb-8 flex items-center gap-2">
          <FolderKanban className="w-7 h-7 text-orange-500" />
          <span className="text-2xl font-bold text-orange-400 tracking-wider font-mono uppercase">
            PROJECT
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const href = `/project/${projectId}/${item.key}`;
            const isActive = pathname.endsWith(`/${item.key}`);
            return (
              <Link
                key={item.key}
                href={href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-mono text-sm tracking-widest uppercase transition-colors font-bold
                  ${
                    isActive
                      ? "bg-[#23232a] border-l-4 border-orange-500 text-orange-400"
                      : "text-neutral-300 hover:bg-[#23232a] hover:text-orange-400"
                  }
                `}
                style={{ letterSpacing: "0.1em" }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-4 min-h-screen overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
