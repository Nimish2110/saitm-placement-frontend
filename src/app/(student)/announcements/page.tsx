"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { fetchAnnouncements, Announcement } from "@/lib/announcements";
import { useAnnouncementsBadgeStore } from "@/lib/announcementsBadge";
import { Megaphone, ShieldCheck, Briefcase } from "lucide-react";

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const markSeen = useAnnouncementsBadgeStore((s) => s.markSeen);

  useEffect(() => {
    fetchAnnouncements()
      .then(setAnnouncements)
      .catch(() => setError("Could not load announcements."))
      .finally(() => setLoading(false));
    markSeen(); // clears the sidebar badge instantly, everywhere, no reload needed
  }, [markSeen]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <p className="text-[13px] text-muted mt-1">Updates from the Placement Cell and Admin</p>
      </div>

      {loading && <Card className="text-center py-16 text-sm text-muted">Loading...</Card>}
      {error && <Card className="text-center py-16 text-sm text-danger">{error}</Card>}

      {!loading && !error && announcements.length === 0 && (
        <Card className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-primary-50 text-primary grid place-items-center mx-auto mb-4">
            <Megaphone size={24} />
          </div>
          <h3 className="text-base font-bold mb-1">No announcements right now</h3>
          <p className="text-sm text-muted">Check back later for updates.</p>
        </Card>
      )}

      {!loading && !error && announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-[15px] font-bold">{a.title}</h3>
                {a.target_type === "filtered" && <Pill color="warning">For your batch</Pill>}
              </div>
              <p className="text-[13px] text-ink-2 mb-3 whitespace-pre-wrap">{a.message}</p>
              <span className="text-[11px] text-muted flex items-center gap-1">
                {a.created_by_role === "admin" ? <ShieldCheck size={11} /> : <Briefcase size={11} />}
                {a.created_by_name} · {new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}