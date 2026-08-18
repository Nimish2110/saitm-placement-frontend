"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { api } from "@/lib/api";
import { Drive } from "@/lib/notifications";
import { DriveApplicantsModal } from "@/components/placements/DriveApplicantsModal";
import { Users, Calendar, Clock } from "lucide-react";

export default function DrivesFloatedPage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);

  useEffect(() => {
    api<Drive[]>("/api/drives/mine/")
      .then(setDrives)
      .catch(() => setError("Could not load your drives."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Drives Floated</h1>
        <p className="text-[13px] text-muted mt-1">Every drive posted from this account · {drives.length} total · Click a card to see who applied</p>
      </div>

      {loading && <Card className="text-center py-16 text-sm text-muted">Loading...</Card>}
      {error && <Card className="text-center py-16 text-sm text-danger">{error}</Card>}

      {!loading && !error && (
        <div className="space-y-4">
          {drives.map((d) => (
            <Card
              key={d.id}
              onClick={() => setSelectedDrive(d)}
              className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h3 className="text-lg font-bold">{d.company_name}</h3>
                    <Pill color="info">{d.drive_type}</Pill>
                    <Pill color={d.status === "open" ? "success" : "neutral"}>{d.status}</Pill>
                  </div>
                  <p className="text-[11.5px] text-muted">
                    <span className="font-semibold text-ink-2">Role Offered:</span> {d.profiles_offered.join(", ")}
                  </p>
                </div>
                <div className="text-right text-[12px]">
                  <div className="flex items-center justify-end gap-1.5 font-bold text-ink">
                    <Calendar size={12} className="text-muted" />
                    Posted {new Date(d.posted_on).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 font-bold text-danger mt-0.5">
                    <Clock size={12} />
                    Deadline: {new Date(d.last_date_of_application).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <MiniStat label="CTC" value={d.ctc} />
                <MiniStat label="Location" value={d.job_location} />
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedDrive(d); }}
                  className="bg-primary-50 hover:bg-primary hover:text-white rounded-[10px] p-3 text-left transition-colors group"
                >
                  <div className="text-[10px] text-primary group-hover:text-white/80 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                    <Users size={11} /> Registrations
                  </div>
                  <div className="text-[13px] font-bold text-primary group-hover:text-white">{d.applications_count} applied</div>
                </button>
              </div>

              <div className="mb-1.5">
                <span className="text-[10.5px] font-semibold text-muted uppercase tracking-wide">Eligible Courses</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {d.eligible_courses.map((c) => <Pill key={c} color="neutral">{c}</Pill>)}
                </div>
              </div>
              <div>
                <span className="text-[10.5px] font-semibold text-muted uppercase tracking-wide">Eligible Batches</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {d.eligible_batches.map((b) => <Pill key={b} color="primary">Batch {b}</Pill>)}
                </div>
              </div>

              {d.pm_note && (
                <p className="text-[11.5px] text-muted italic mt-3 pt-3 border-t border-border-soft">📝 {d.pm_note}</p>
              )}
            </Card>
          ))}

          {drives.length === 0 && <Card className="text-center py-16 text-sm text-muted">You haven&apos;t posted any drives yet.</Card>}
        </div>
      )}

      <DriveApplicantsModal
        driveId={selectedDrive?.id ?? null}
        companyName={selectedDrive?.company_name ?? ""}
        open={!!selectedDrive}
        onClose={() => setSelectedDrive(null)}
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-2 rounded-[10px] p-3">
      <div className="text-[10px] text-muted uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-[13px] font-semibold">{value}</div>
    </div>
  );
}