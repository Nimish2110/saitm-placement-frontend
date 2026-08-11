"use client";

import { Search, Bell } from "lucide-react";

export function PMNavbar() {
  return (
    <nav className="h-16 bg-white border-b border-border flex items-center px-6 gap-5 sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold text-sm">
          PM
        </div>
        <div className="leading-tight">
          <div className="font-bold text-sm">SAITM</div>
          <div className="text-[11px] text-muted">Placement Manager Console</div>
        </div>
      </div>
      <div className="flex-1 max-w-[480px] relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          placeholder="Search companies, students, drives..."
          className="w-full h-10 pl-10 pr-4 rounded-[10px] border border-border bg-surface-2 text-sm focus:outline-none focus:border-primary focus:bg-white"
        />
      </div>
      <div className="flex-1" />
      <button className="w-10 h-10 rounded-[10px] grid place-items-center text-muted hover:bg-surface-2 hover:text-ink relative">
        <Bell size={18} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white" />
      </button>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-white grid place-items-center font-semibold text-sm">
        PM
      </div>
    </nav>
  );
}
