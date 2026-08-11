"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { studentAuth } from "@/lib/auth";
import { useRemarksStore } from "@/lib/remarks";
import { useAnnouncementsBadgeStore } from "@/lib/announcementsBadge";
import { useAssessmentsBadgeStore } from "@/lib/assessmentsBadge";
import { LayoutDashboard, UserCircle, Briefcase, Bell, ClipboardList, FileEdit, Megaphone } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const remarks = useRemarksStore((s) => s.remarks);
  const fetchRemarks = useRemarksStore((s) => s.fetchRemarks);

  const announcementsUnread = useAnnouncementsBadgeStore((s) => s.unreadCount);
  const fetchAnnouncementsUnread = useAnnouncementsBadgeStore((s) => s.fetchUnreadCount);

  const assessmentsUnattempted = useAssessmentsBadgeStore((s) => s.unattemptedCount);
  const fetchAssessmentsUnattempted = useAssessmentsBadgeStore((s) => s.refreshUnattemptedCount);

  useEffect(() => {
    fetchRemarks();
    fetchAnnouncementsUnread();
    fetchAssessmentsUnattempted();
  }, [fetchRemarks, fetchAnnouncementsUnread, fetchAssessmentsUnattempted]);

  const nav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/notifications", label: "Notifications", icon: Bell, badgeCount: remarks.length },
    { href: "/jobs-placements", label: "Jobs & Placements", icon: Briefcase },
    { href: "/assessments", label: "Assessments", icon: ClipboardList, badgeCount: assessmentsUnattempted },
    { href: "/resume-builder", label: "Resume Builder", icon: FileEdit },
    { href: "/announcements", label: "Announcements", icon: Megaphone, badgeCount: announcementsUnread },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <AuthGuard isAuthed={studentAuth.isAuthed} redirectTo="/login">
      <div className="min-h-screen bg-surface-2">
        <Header userInitial="S" homeHref="/dashboard" notificationCount={remarks.length} notificationHref="/notifications" />
        <div className="flex">
          <Sidebar nav={nav} />
          <main className="flex-1 p-6 max-w-[1200px]">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}