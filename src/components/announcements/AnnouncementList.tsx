"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Announcement, deleteAnnouncement } from "@/lib/announcements";
import { Trash2, Megaphone, ShieldCheck, Briefcase } from "lucide-react";

export function AnnouncementList({
  announcements, onDeleted, canManage = true,
}: { announcements: Announcement[]; onDeleted: (id: string) => void; canManage?: boolean }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    setDeletingId(id);
    setError("");
    try {
      await deleteAnnouncement(id);
      onDeleted(id);
    } catch {
      setError("Could not delete — you may not have permission to remove this one.");
    } finally {
      setDeletingId(null);
    }
  }

  if (announcements.length === 0) {
    return (
      <Card className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-primary-50 text-primary grid place-items-center mx-auto mb-4">
          <Megaphone size={24} />
        </div>
        <h3 className="text-base font-bold mb-1">No announcements yet</h3>
        <p className="text-sm text-muted">Posted announcements will show up here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-danger">{error}</p>}
      {announcements.map((a) => (
        <Card key={a.id}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-[15px] font-bold">{a.title}</h3>
            {canManage && (
              <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} className="text-muted hover:text-danger flex-shrink-0">
                <Trash2 size={15} />
              </button>
            )}
          </div>
          <p className="text-[13px] text-ink-2 mb-3 whitespace-pre-wrap">{a.message}</p>
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            {a.target_type === "all" ? (
              <Pill color="info">All Students</Pill>
            ) : (
              <>
                {a.eligible_courses.map((c) => <Pill key={c} color="neutral">{c}</Pill>)}
                {a.eligible_batches.map((b) => <Pill key={b} color="neutral">Batch {b}</Pill>)}
              </>
            )}
            <span className="text-muted flex items-center gap-1 ml-auto">
              {a.created_by_role === "admin" ? <ShieldCheck size={11} /> : <Briefcase size={11} />}
              {a.created_by_name} · {new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}