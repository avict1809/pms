"use client";
import { useAuth } from "@/hooks/useAuthRedirect";
import AuthGuard from "@/components/auth/AuthGuard";
import StudentAnnouncements from "@/components/announcements/StudentAnnouncements";
import SupervisorAnnouncements from "@/components/announcements/SupervisorAnnouncements";
import AnnouncementFeed from "@/components/announcements/AnnouncementFeed";

export default function AnnouncementsPage() {
  const { user } = useAuth();

  const renderAnnouncements = () => {
    switch (user?.role) {
      case "student":
        return <StudentAnnouncements />;
      case "supervisor":
        return <SupervisorAnnouncements />;
      case "admin":
        return (
          <AnnouncementFeed
            title="All Announcements"
            description="View all system announcements"
          />
        );
      default:
        return (
          <AnnouncementFeed
            title="Announcements"
            description="Stay updated with the latest announcements"
          />
        );
    }
  };

  return (
    <AuthGuard requiredRoles={["admin", "supervisor", "student"]}>
      <div className="max-w-7xl mx-auto">{renderAnnouncements()}</div>
    </AuthGuard>
  );
}
