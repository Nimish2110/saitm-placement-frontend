"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, UserCircle, Bell, Briefcase } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/jobs-placements", label: "Jobs & Placements", icon: Briefcase },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-border p-3 flex flex-col h-[calc(100vh-64px)] sticky top-16">
      {nav.map((n) => {
        const active = pathname === n.href || pathname.startsWith(n.href + "/");
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium mb-0.5 transition-colors",
              active ? "bg-primary-50 text-primary font-semibold" : "text-muted hover:bg-surface-2 hover:text-ink"
            )}
          >
            <n.icon size={18} className="flex-shrink-0" />
            {n.label}
          </Link>
        );
      })}

      <div className="mt-auto p-4 rounded-[14px] bg-gradient-to-br from-primary to-accent text-white text-xs">
        <h4 className="text-sm font-bold mb-1">📚 SAITM T&P Cell</h4>
        <p className="opacity-90">All placement drives, applications, and updates live here.</p>
      </div>
    </aside>
  );
}
