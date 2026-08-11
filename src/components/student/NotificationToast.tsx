"use client";

import { useRouter } from "next/navigation";
import { useDriveStore } from "@/lib/notifications";
import { Briefcase, X } from "lucide-react";
import { useEffect, useState } from "react";

export function NotificationToast() {
  const router = useRouter();
  const drives = useDriveStore((s) => s.drives);
  const [visible, setVisible] = useState(false);
  const [shownId, setShownId] = useState<string | null>(null);

  const latest = drives[0];

  useEffect(() => {
    // Show once per browser session for the most recent drive.
    if (!latest) return;
    const seenKey = "saitm_last_seen_drive";
    const lastSeen = sessionStorage.getItem(seenKey);
    if (lastSeen !== latest.id) {
      setShownId(latest.id);
      setVisible(true);
      sessionStorage.setItem(seenKey, latest.id);
      const t = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(t);
    }
  }, [latest]);

  const drive = drives.find((d) => d.id === shownId);
  if (!drive || !visible) return null;

  function handleOpen() {
    setVisible(false);
    router.push("/notifications");
  }

  return (
    <div className="fixed top-5 right-5 z-50 w-[360px]">
      <div onClick={handleOpen} className="bg-white/95 backdrop-blur border border-border rounded-2xl shadow-2xl p-4 flex gap-3 cursor-pointer hover:scale-[1.02] transition-transform">
        <div className="w-10 h-10 rounded-[10px] bg-primary-50 text-primary grid place-items-center flex-shrink-0">
          <Briefcase size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Placements Update</span>
            <button onClick={(e) => { e.stopPropagation(); setVisible(false); }} className="text-muted-2 hover:text-ink">
              <X size={14} />
            </button>
          </div>
          <h4 className="text-[13px] font-bold truncate">{drive.company_name} — {drive.drive_type}</h4>
          <p className="text-[11.5px] text-muted truncate">{drive.profiles_offered.join(", ")}</p>
        </div>
      </div>
    </div>
  );
}
