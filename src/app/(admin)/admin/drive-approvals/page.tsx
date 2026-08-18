"use client";

import { useEffect, useState } from "react";
import { Card, CardHead } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { fetchPendingDrives, fetchPublishedDrives, approveDrive, rejectDrive, deleteDrive, AdminDrive } from "@/lib/adminDrives";
import { DriveEditModal } from "@/components/placements/DriveEditModal";
import { ClipboardList, CheckCircle2, Pencil, Check, X, Calendar, Clock, Trash2 } from "lucide-react";

type Panel = "none" | "pending" | "published";

export default function DriveApprovalsPage() {
  const [panel, setPanel] = useState<Panel>("none");

  const [pending, setPending] = useState<AdminDrive[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const [published, setPublished] = useState<AdminDrive[]>([]);
  const [loadingPublished, setLoadingPublished] = useState(false);

  const [editingDrive, setEditingDrive] = useState<AdminDrive | null>(null);
  const [error, setError] = useState("");

  function togglePending() {
    const next = panel === "pending" ? "none" : "pending";
    setPanel(next);
    if (next === "pending") loadPending();
  }
  function togglePublished() {
    const next = panel === "published" ? "none" : "published";
    setPanel(next);
    if (next === "published") loadPublished();
  }

  function loadPending() {
    setLoadingPending(true);
    setError("");
    fetchPendingDrives().then(setPending).catch(() => setError("Could not load pending drives.")).finally(() => setLoadingPending(false));
  }
  function loadPublished() {
    setLoadingPublished(true);
    setError("");
    fetchPublishedDrives().then(setPublished).catch(() => setError("Could not load published drives.")).finally(() => setLoadingPublished(false));
  }

  useEffect(loadPending, []);

  async function handleApprove(id: string) {
    if (!confirm("Approve and publish this drive? Eligible students will be notified immediately.")) return;
    setActioningId(id);
    setError("");
    try {
      await approveDrive(id);
      setPending((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("Could not approve this drive.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Reject this drive? It will not be shown to students.")) return;
    setActioningId(id);
    setError("");
    try {
      await rejectDrive(id);
      setPending((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("Could not reject this drive.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleDeleteDrive(id: string, companyName: string) {
    if (!confirm(`Permanently delete "${companyName}"? This removes the drive, its JD files, and every application submitted to it. This cannot be undone.`)) return;
    setActioningId(id);
    setError("");
    try {
      await deleteDrive(id);
      setPublished((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("Could not delete this drive.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Drive Approvals</h1>
        <p className="text-[13px] text-muted mt-1">Review every drive a Placement Manager submits before it goes live to students</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={togglePending} className="text-left">
          <Card className={`flex items-center gap-4 h-full transition-colors cursor-pointer hover:border-primary ${panel === "pending" ? "border-primary bg-primary-50" : ""}`}>
            <div className="w-12 h-12 rounded-[10px] bg-warning-50 text-warning grid place-items-center flex-shrink-0">
              <ClipboardList size={22} />
            </div>
            <div>
              <div className="text-xs text-muted">Pending Approval</div>
              <div className="text-2xl font-bold">{pending.length}</div>
            </div>
          </Card>
        </button>

        <button onClick={togglePublished} className="text-left">
          <Card className={`flex items-center gap-4 h-full transition-colors cursor-pointer hover:border-primary ${panel === "published" ? "border-primary bg-primary-50" : ""}`}>
            <div className="w-12 h-12 rounded-[10px] bg-success-50 text-success grid place-items-center flex-shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="text-xs text-muted">Total Drives Posted</div>
              <div className="text-2xl font-bold">{panel === "published" ? published.length : "Click to view"}</div>
            </div>
          </Card>
        </button>
      </div>

      {error && <p className="text-xs text-danger mb-4">{error}</p>}

      {panel === "pending" && (
        <Card>
          <CardHead title="Pending Approval" />
          {loadingPending && <p className="text-sm text-muted text-center py-10">Loading...</p>}
          {!loadingPending && pending.length === 0 && (
            <p className="text-sm text-muted text-center py-10">Nothing waiting for review right now.</p>
          )}
          {!loadingPending && pending.length > 0 && (
            <div className="space-y-3">
              {pending.map((d) => (
                <div key={d.id} className="border border-border rounded-[10px] p-4">
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[15px] font-bold">{d.company_name}</h4>
                        <Pill color="info">{d.drive_type}</Pill>
                      </div>
                      <p className="text-[11.5px] text-muted">
                        <span className="font-semibold text-ink-2">Role Offered:</span> {d.profiles_offered.join(", ") || "—"} · Submitted by {d.posted_by_name}
                      </p>
                    </div>
                    <div className="text-right text-[12px]">
                      <div className="flex items-center justify-end gap-1.5 font-bold text-ink">
                        <Calendar size={12} className="text-muted" />
                        Submitted {new Date(d.posted_on).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 font-bold text-danger mt-0.5">
                        <Clock size={12} />
                        Deadline: {new Date(d.last_date_of_application).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2.5">
                    <MiniStat label="CTC" value={d.ctc || "—"} />
                    <MiniStat label="Location" value={d.job_location || "—"} />
                  </div>

                  {d.jd_text && (
                    <p className="text-[12px] text-muted bg-surface-2 rounded-lg p-2.5 mb-2.5 line-clamp-3">{d.jd_text}</p>
                  )}

                  <div className="mb-1">
                    <span className="text-[10.5px] font-semibold text-muted uppercase tracking-wide">Eligible Courses</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {d.eligible_courses.length > 0 ? d.eligible_courses.map((c) => <Pill key={c} color="neutral">{c}</Pill>) : <span className="text-[11px] text-muted-2">None selected</span>}
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-[10.5px] font-semibold text-muted uppercase tracking-wide">Eligible Batches</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {d.eligible_batches.length > 0 ? d.eligible_batches.map((b) => <Pill key={b} color="primary">Batch {b}</Pill>) : <span className="text-[11px] text-muted-2">None selected</span>}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingDrive(d)}>
                      <Pencil size={13} /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      disabled={actioningId === d.id}
                      onClick={() => handleReject(d.id)}
                      className="text-danger border-red-200 hover:border-danger"
                    >
                      <X size={14} /> Reject
                    </Button>
                    <Button
                      disabled={actioningId === d.id}
                      onClick={() => handleApprove(d.id)}
                      className="bg-success hover:bg-success"
                    >
                      <Check size={14} /> {actioningId === d.id ? "..." : "Accept & Publish"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {panel === "published" && (
        <Card>
          <CardHead title="Total Drives Posted" />
          {loadingPublished && <p className="text-sm text-muted text-center py-10">Loading...</p>}
          {!loadingPublished && published.length === 0 && (
            <p className="text-sm text-muted text-center py-10">No drives have been published yet.</p>
          )}
          {!loadingPublished && published.length > 0 && (
            <div className="space-y-3">
              {published.map((d) => (
                <div key={d.id} className="border border-border rounded-[10px] p-4">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-bold">{d.company_name}</h4>
                      <Pill color="info">{d.drive_type}</Pill>
                      <Pill color="success">Live</Pill>
                    </div>
                    <button
                      onClick={() => handleDeleteDrive(d.id, d.company_name)}
                      disabled={actioningId === d.id}
                      title="Delete this drive permanently"
                      className="text-muted hover:text-danger disabled:opacity-50 flex-shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="text-[11.5px] text-muted mb-2">
                    <span className="font-semibold text-ink-2">Role Offered:</span> {d.profiles_offered.join(", ") || "—"} · Posted by {d.posted_by_name}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <MiniStat label="CTC" value={d.ctc || "—"} />
                    <MiniStat label="Location" value={d.job_location || "—"} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {d.eligible_courses.map((c) => <Pill key={c} color="neutral">{c}</Pill>)}
                    {d.eligible_batches.map((b) => <Pill key={b} color="primary">Batch {b}</Pill>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <DriveEditModal
        drive={editingDrive}
        open={!!editingDrive}
        onClose={() => setEditingDrive(null)}
        onSaved={(updated) => setPending((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))}
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-2 rounded-[10px] p-2.5">
      <div className="text-[10px] text-muted uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-[12.5px] font-semibold">{value}</div>
    </div>
  );
}