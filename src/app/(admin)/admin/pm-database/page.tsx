"use client";

import { useEffect, useState } from "react";
import { Card, CardHead } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fetchPMCount, fetchPendingPMs, fetchActivePMs, approvePM, rejectPM, deletePM, PendingPM } from "@/lib/admin";
import { Users, ClipboardList, Check, X, Mail, Phone, Hash, Trash2, Loader2 } from "lucide-react";

type Panel = "none" | "pending" | "active";

export default function PMDatabasePage() {
  const [count, setCount] = useState<number | null>(null);
  const [panel, setPanel] = useState<Panel>("none");

  const [pending, setPending] = useState<PendingPM[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const [active, setActive] = useState<PendingPM[]>([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchPMCount().then((r) => setCount(r.count));
  }, []);

  function togglePending() {
    const next = panel === "pending" ? "none" : "pending";
    setPanel(next);
    if (next === "pending") loadPending();
  }

  function toggleActive() {
    const next = panel === "active" ? "none" : "active";
    setPanel(next);
    if (next === "active") loadActive();
  }

  function loadPending() {
    setLoadingPending(true);
    setError("");
    fetchPendingPMs()
      .then(setPending)
      .catch(() => setError("Could not load pending applications."))
      .finally(() => setLoadingPending(false));
  }

  function loadActive() {
    setLoadingActive(true);
    setError("");
    fetchActivePMs()
      .then(setActive)
      .catch(() => setError("Could not load active Placement Managers."))
      .finally(() => setLoadingActive(false));
  }

  async function handleAccept(id: string) {
    setActioningId(id);
    setError("");
    try {
      await approvePM(id);
      setPending((prev) => prev.filter((p) => p.id !== id));
      fetchPMCount().then((r) => setCount(r.count));
    } catch {
      setError("Could not approve this application.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: string) {
    setActioningId(id);
    setError("");
    try {
      await rejectPM(id);
      setPending((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Could not reject this application.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleDelete(pm: PendingPM) {
    if (!confirm(`Permanently delete ${pm.full_name}'s Placement Manager account?\n\nDrives, resume formats, and announcements they created will be kept (unattributed), but their account and login access will be gone. This cannot be undone.`)) return;
    setDeletingId(pm.id);
    setError("");
    try {
      await deletePM(pm.id);
      setActive((prev) => prev.filter((p) => p.id !== pm.id));
      fetchPMCount().then((r) => setCount(r.count));
    } catch {
      setError("Could not delete this Placement Manager.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">PM Database</h1>
        <p className="text-[13px] text-muted mt-1">Placement Managers currently registered and working in the portal</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={toggleActive} className="text-left">
          <Card className={`flex items-center gap-4 h-full transition-colors cursor-pointer hover:border-primary ${panel === "active" ? "border-primary bg-primary-50" : ""}`}>
            <div className="w-12 h-12 rounded-[10px] bg-primary-50 text-primary grid place-items-center flex-shrink-0">
              <Users size={22} />
            </div>
            <div>
              <div className="text-xs text-muted">Active Placement Managers</div>
              <div className="text-2xl font-bold">{count === null ? "…" : count}</div>
            </div>
          </Card>
        </button>

        <button onClick={togglePending} className="text-left">
          <Card className={`flex items-center gap-4 h-full transition-colors cursor-pointer hover:border-primary ${panel === "pending" ? "border-primary bg-primary-50" : ""}`}>
            <div className="w-12 h-12 rounded-[10px] bg-warning-50 text-warning grid place-items-center flex-shrink-0">
              <ClipboardList size={22} />
            </div>
            <div>
              <div className="text-xs text-muted">Applied for PM</div>
              <div className="text-2xl font-bold">{panel === "pending" ? "Viewing" : "Click to view"}</div>
            </div>
          </Card>
        </button>
      </div>

      {error && <p className="text-xs text-danger mb-4">{error}</p>}

      {panel === "active" && (
        <Card>
          <CardHead title="Active Placement Managers" />
          {loadingActive && <p className="text-sm text-muted text-center py-10">Loading...</p>}
          {!loadingActive && active.length === 0 && (
            <p className="text-sm text-muted text-center py-10">No active Placement Managers yet.</p>
          )}
          {!loadingActive && active.length > 0 && (
            <div className="space-y-3">
              {active.map((p) => (
                <div key={p.id} className="border border-border rounded-[10px] p-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold mb-1">{p.full_name}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
                      <span className="flex items-center gap-1"><Mail size={12} /> {p.email}</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> {p.phone}</span>
                      {p.employee_id && <span className="flex items-center gap-1"><Hash size={12} /> {p.employee_id}</span>}
                    </div>
                    <p className="text-[11px] text-muted-2 mt-1">
                      Joined {new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={deletingId === p.id}
                    title="Delete this Placement Manager permanently"
                    className="text-muted hover:text-danger disabled:opacity-50 flex-shrink-0"
                  >
                    {deletingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {panel === "pending" && (
        <Card>
          <CardHead title="Pending PM applications" />
          {loadingPending && <p className="text-sm text-muted text-center py-10">Loading...</p>}

          {!loadingPending && pending.length === 0 && (
            <p className="text-sm text-muted text-center py-10">No pending applications right now.</p>
          )}

          {!loadingPending && pending.length > 0 && (
            <div className="space-y-3">
              {pending.map((p) => (
                <div key={p.id} className="border border-border rounded-[10px] p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h4 className="text-sm font-bold mb-1">{p.full_name}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
                      <span className="flex items-center gap-1"><Mail size={12} /> {p.email}</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> {p.phone}</span>
                      {p.employee_id && <span className="flex items-center gap-1"><Hash size={12} /> {p.employee_id}</span>}
                    </div>
                    <p className="text-[11px] text-muted-2 mt-1">
                      Applied {new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={actioningId === p.id}
                      onClick={() => handleReject(p.id)}
                      className="text-danger border-red-200 hover:border-danger"
                    >
                      <X size={14} /> Reject
                    </Button>
                    <Button disabled={actioningId === p.id} onClick={() => handleAccept(p.id)}>
                      <Check size={14} /> {actioningId === p.id ? "..." : "Accept"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}