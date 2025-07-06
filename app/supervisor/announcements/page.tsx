"use client";
import AuthGuard from "@/components/auth/AuthGuard";
import SupervisorAnnouncements from "@/components/announcements/SupervisorAnnouncements";

export default function SupervisorAnnouncementsPage() {
  return (
    <AuthGuard allowedRoles={["supervisor"]}>
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <SupervisorAnnouncements />
        </div>
      </div>
    </AuthGuard>
  );
}
