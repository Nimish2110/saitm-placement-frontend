"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { pmAuth } from "@/lib/auth";
import { GraduationCap, FilePlus2, ListChecks, UserCircle, Megaphone, FileEdit } from "lucide-react";

const nav: NavItem[] = [
  { href: "/pm/students", label: "Student Database", icon: GraduationCap },
  { href: "/pm/drive-creation", label: "Drive Creation", icon: FilePlus2 },
  { href: "/pm/drives-floated", label: "Drives Floated", icon: ListChecks },
  { href: "/pm/resume-formats", label: "Resume Formats", icon: FileEdit },
  { href: "/pm/announcements", label: "Announcements", icon: Megaphone },
  { href: "/pm/profile", label: "Profile", icon: UserCircle },
];

export default function PMLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard isAuthed={pmAuth.isAuthed} redirectTo="/pm-login">
      <div className="min-h-screen bg-surface-2">
        <Header userInitial="PM" homeHref="/pm/students" />
        <div className="flex">
          <Sidebar nav={nav} />
          <main className="flex-1 p-6 max-w-[1300px]">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}