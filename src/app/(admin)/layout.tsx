"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { adminAuth } from "@/lib/auth";
import { Users, Megaphone, GraduationCap } from "lucide-react";

const nav: NavItem[] = [
  { href: "/admin/pm-database", label: "PM Database", icon: Users },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/students", label: "Student Database", icon: GraduationCap },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard isAuthed={adminAuth.isAuthed} redirectTo="/admin-login">
      <div className="min-h-screen bg-surface-2">
        <Header userInitial="A" homeHref="/admin/pm-database" />
        <div className="flex">
          <Sidebar nav={nav} />
          <main className="flex-1 p-6 max-w-[1300px]">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}