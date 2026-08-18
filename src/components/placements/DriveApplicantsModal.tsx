"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { fetchDriveApplicants, DriveApplicant } from "@/lib/driveApplicants";
import { courseOptions, batchOptions } from "@/lib/students";
import { Users } from "lucide-react";

export function DriveApplicantsModal({
  driveId, companyName, open, onClose,
}: { driveId: string | null; companyName: string; open: boolean; onClose: () => void }) {
  const [applicants, setApplicants] = useState<DriveApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");

  useEffect(() => {
    if (!open || !driveId) return;
    setLoading(true);
    setError("");
    fetchDriveApplicants(driveId, { course: courseFilter, batch: batchFilter })
      .then(setApplicants)
      .catch(() => setError("Could not load applicants."))
      .finally(() => setLoading(false));
  }, [open, driveId, courseFilter, batchFilter]);

  useEffect(() => {
    if (!open) { setCourseFilter(""); setBatchFilter(""); }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={`Applicants — ${companyName}`} width={720}>
      <div className="flex gap-2.5 mb-4">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="h-9 px-3 rounded-[10px] border border-border text-[13px] flex-1"
        >
          <option value="">All Courses</option>
          {courseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="h-9 px-3 rounded-[10px] border border-border text-[13px] w-40"
        >
          <option value="">All Batches</option>
          {batchOptions.map((b) => <option key={b} value={b}>Batch {b}</option>)}
        </select>
      </div>

      {loading && <p className="text-sm text-muted text-center py-10">Loading...</p>}
      {error && <p className="text-sm text-danger text-center py-10">{error}</p>}

      {!loading && !error && applicants.length === 0 && (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-full bg-primary-50 text-primary grid place-items-center mx-auto mb-3">
            <Users size={20} />
          </div>
          <p className="text-sm text-muted">No applicants match this filter.</p>
        </div>
      )}

      {!loading && !error && applicants.length > 0 && (
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border sticky top-0 bg-white">
                {["Name", "Roll No.", "Course", "Batch", "Status", "Applied On"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-2 text-[10.5px] font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a.id} className="border-b border-border-soft last:border-0">
                  <td className="py-2.5 px-2 font-semibold">{a.student_name}</td>
                  <td className="py-2.5 px-2">{a.roll_no}</td>
                  <td className="py-2.5 px-2">{a.course}</td>
                  <td className="py-2.5 px-2">{a.batch}</td>
                  <td className="py-2.5 px-2">{a.status}</td>
                  <td className="py-2.5 px-2 text-muted">{new Date(a.applied_on).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}