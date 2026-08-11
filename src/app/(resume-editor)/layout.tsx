"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { Header } from "@/components/layout/Header";
import { studentAuth } from "@/lib/auth";

// Deliberately no <Sidebar /> here — the resume editor is a focused,
// full-width workspace, not part of the normal app navigation shell.
export default function ResumeEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard isAuthed={studentAuth.isAuthed} redirectTo="/login">
      <div className="min-h-screen bg-surface-2">
        <Header userInitial="S" homeHref="/dashboard" />
        <main className="max-w-[1300px] mx-auto p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}