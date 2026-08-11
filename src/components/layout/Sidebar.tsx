"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeCount?: number;
}

const STORAGE_KEY = "saitm_sidebar_collapsed";

export function Sidebar({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(STORAGE_KEY) === "true") setCollapsed(true);
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  if (!mounted) return <aside className="w-60 border-r border-border h-[calc(100vh-64px)] sticky top-16 bg-white" />;

  return (
    <aside
      className={cn(
        "bg-white border-r border-border flex flex-col h-[calc(100vh-64px)] sticky top-16 transition-[width] duration-200 ease-out",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      <nav className="flex-1 p-3 overflow-y-auto">
        {nav.map((n) => {
          const active = pathname === n.href || pathname.startsWith(n.href + "/");
          const hasBadge = !!n.badgeCount && n.badgeCount > 0;
          return (
            <Link
              key={n.href}
              href={n.href}
              title={collapsed ? `${n.label}${hasBadge ? ` (${n.badgeCount})` : ""}` : undefined}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium mb-0.5 transition-colors",
                collapsed && "justify-center px-0",
                active ? "bg-primary-50 text-primary font-semibold" : "text-muted hover:bg-surface-2 hover:text-ink"
              )}
            >
              <span className="relative flex-shrink-0">
                <n.icon size={18} />
                {hasBadge && collapsed && (
                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-danger" />
                )}
              </span>
              {!collapsed && <span className="truncate flex-1">{n.label}</span>}
              {!collapsed && hasBadge && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold grid place-items-center flex-shrink-0">
                  {n.badgeCount! > 9 ? "9+" : n.badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={toggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex items-center justify-center gap-2 py-3 border-t border-border text-muted hover:text-ink hover:bg-surface-2 text-xs font-medium transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : (<><ChevronLeft size={16} /> Collapse</>)}
      </button>
    </aside>
  );
}