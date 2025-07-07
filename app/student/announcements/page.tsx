"use client";
import AuthGuard from "@/components/auth/AuthGuard";
import StudentAnnouncements from "@/components/announcements/StudentAnnouncements";

export default function StudentAnnouncementsPage() {
  return (
    <AuthGuard requiredRoles={["student"]}>
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <StudentAnnouncements />
        </div>
      </div>
    </AuthGuard>
  );
}
