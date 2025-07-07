"use client";
import AuthGuard from "@/components/auth/AuthGuard";
import StudentAnnouncements from "@/components/announcements/StudentAnnouncements";

export default function StudentAnnouncementsPage() {
  return (
    <AuthGuard requiredRole={"student"}>
      <div className="min-h-screen text-white p-6">
        <div className="max-w-7xl mx-auto">
          <StudentAnnouncements />
        </div>
      </div>
    </AuthGuard>
  );
}
