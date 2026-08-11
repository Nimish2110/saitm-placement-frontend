"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";

export function Header({
  userInitial,
  homeHref,
  notificationCount = 0,
  notificationHref,
}: {
  userInitial: string;
  homeHref: string;
  notificationCount?: number;
  notificationHref?: string;
}) {
  return (
    <header className="h-20 bg-white border-b border-border flex items-center justify-between px-5 sticky top-0 z-30">
      <Link href={homeHref} className="flex items-center flex-shrink-0">
        <Image
          src="/college-logo.png"
          alt="St. Andrews Institute of Technology & Management"
          width={420}
          height={72}
          className="h-16 w-auto object-contain"
          priority
        />
      </Link>

      <div className="flex items-center gap-4 flex-shrink-0">
        {notificationHref ? (
          <Link href={notificationHref} title="Notifications" className="relative text-muted hover:text-ink transition-colors">
            <Bell size={19} />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[9px] font-bold grid place-items-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>
        ) : (
          <button title="Notifications" className="relative text-muted hover:text-ink transition-colors">
            <Bell size={19} />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-white grid place-items-center text-xs font-bold flex-shrink-0">
          {userInitial}
        </div>
      </div>
    </header>
  );
}