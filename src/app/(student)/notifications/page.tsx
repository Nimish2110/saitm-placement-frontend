"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useDriveStore } from "@/lib/notifications";
import { useRemarksStore } from "@/lib/remarks";
import { Briefcase, ChevronRight, MessageSquareText, Check } from "lucide-react";

export default function NotificationsPage() {
  const { drives, loading, error, fetchDrives } = useDriveStore();
  const { remarks, loading: remarksLoading, fetchRemarks, markAsRead } = useRemarksStore();

  useEffect(() => {
    fetchDrives();
    fetchRemarks();
  }, [fetchDrives, fetchRemarks]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-[13px] text-muted mt-1">Remarks from the T&P Cell, and drive updates — tap a drive for full details</p>
      </div>

      {!remarksLoading && remarks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[11px] font-bold text-muted uppercase tracking-wide mb-3">Remarks from Placement Manager</h2>
          <div className="space-y-2.5">
            {remarks.map((r) => (
              <Card key={r.id} className="flex items-start gap-3.5 bg-warning-50 border-amber-200">
                <div className="w-10 h-10 rounded-[10px] bg-white text-warning grid place-items-center flex-shrink-0">
                  <MessageSquareText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#92400E]">{r.message}</p>
                  <p className="text-[11px] text-[#92400E]/70 mt-1">
                    — {r.placement_manager_name || "Placement Manager"}, {new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => markAsRead(r.id)}
                  title="Mark as read"
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#92400E] bg-white border border-amber-200 rounded-full px-2.5 py-1.5 flex-shrink-0 hover:bg-amber-100 transition-colors"
                >
                  <Check size={12} /> Mark read
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-[11px] font-bold text-muted uppercase tracking-wide mb-3">Placement Drives</h2>

      {loading && <Card className="text-center py-16 text-sm text-muted">Loading...</Card>}
      {error && <Card className="text-center py-16 text-sm text-danger">{error}</Card>}

      {!loading && !error && (
        <div className="space-y-2.5">
          {drives.map((d) => (
            <Link key={d.id} href="/jobs-placements">
              <Card className="flex items-center gap-3.5 hover:border-primary hover:shadow-md transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-[10px] bg-primary-50 text-primary grid place-items-center flex-shrink-0">
                  <Briefcase size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold truncate">{d.company_name}</h4>
                  <p className="text-[12px] text-muted truncate">{d.profiles_offered.join(", ")}</p>
                </div>
                {!d.is_eligible && (
                  <span className="text-[10px] font-semibold text-muted bg-surface-2 px-2 py-1 rounded-full flex-shrink-0">Other branches</span>
                )}
                <ChevronRight size={16} className="text-muted-2 flex-shrink-0" />
              </Card>
            </Link>
          ))}

          {drives.length === 0 && <Card className="text-center py-16 text-sm text-muted">No notifications right now.</Card>}
        </div>
      )}
    </div>
  );
}