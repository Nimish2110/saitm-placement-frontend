"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GraduationCap, FilePlus2, ListFilter, ListChecks, UserCircle } from "lucide-react";

const nav = [
  { href: "/pm/students", label: "Student Database", icon: GraduationCap },
  { href: "/pm/drive-creation", label: "Drive Creation", icon: FilePlus2 },
  { href: "/pm/students-applied", label: "Students Applied", icon: ListFilter },
  { href: "/pm/drives-floated", label: "Drives Floated", icon: ListChecks },
  { href: "/pm/profile", label: "Profile", icon: UserCircle },
];

export function PMSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-border p-3 flex flex-col h-[calc(100vh-64px)] sticky top-16">
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
    </aside>
  );
}
