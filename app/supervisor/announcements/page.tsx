"use client";
import AuthGuard from "@/components/auth/AuthGuard";
import SupervisorAnnouncements from "@/components/announcements/SupervisorAnnouncements";

export default function SupervisorAnnouncementsPage() {
  return (
    <AuthGuard requiredRole={"supervisor"}>
      <div className="min-h-screen text-white p-6">
        <div className="max-w-7xl mx-auto">
          <SupervisorAnnouncements />
        </div>
      </div>
    </AuthGuard>
  );
}
