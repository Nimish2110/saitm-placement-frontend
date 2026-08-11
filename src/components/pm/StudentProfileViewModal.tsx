"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import {
  fetchStudentFullProfile,
  fetchStudentRemarks,
  postStudentRemark,
  StudentFullProfile,
  Remark,
} from "@/lib/pmStudents";
import { FileCheck2, FileX2, Send, User2 } from "lucide-react";

const DOC_LABELS: Record<string, string> = {
  resume: "Resume",
  aadhar: "Aadhar Card",
  tenth_marksheet: "10th Marksheet",
  twelfth_marksheet: "12th Marksheet",
};

export function StudentProfileViewModal({
  studentProfileId,
  open,
  onClose,
}: {
  studentProfileId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<StudentFullProfile | null>(null);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remarkText, setRemarkText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open || !studentProfileId) return;
    setLoading(true);
    setError("");
    setRemarkText("");
    Promise.all([
      fetchStudentFullProfile(studentProfileId),
      fetchStudentRemarks(studentProfileId),
    ])
      .then(([p, r]) => {
        setProfile(p);
        setRemarks(r);
      })
      .catch(() => setError("Could not load this student's profile."))
      .finally(() => setLoading(false));
  }, [open, studentProfileId]);

  async function handleSendRemark() {
    if (!studentProfileId || !remarkText.trim()) return;
    setSending(true);
    try {
      const created = await postStudentRemark(studentProfileId, remarkText.trim());
      setRemarks([created, ...remarks]);
      setRemarkText("");
    } catch {
      setError("Could not send remark.");
    } finally {
      setSending(false);
    }
  }

  if (!studentProfileId) return null;

  return (
    <Modal open={open} onClose={onClose} title="Student Profile" width={720}>
      {loading && <p className="text-center text-sm text-muted py-10">Loading...</p>}
      {error && <p className="text-sm text-danger py-4">{error}</p>}

      {!loading && profile && (
        <>
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
            {profile.profile_photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profile_photo} alt={profile.full_name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-surface-2 grid place-items-center flex-shrink-0">
                <User2 size={26} className="text-muted-2" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold">{profile.full_name}</h3>
              <p className="text-xs text-muted">{profile.roll_no} · {profile.course} · Batch {profile.batch}</p>
            </div>
          </div>

          <SectionTitle>Contact</SectionTitle>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5 text-[12.5px]">
            <ReadRow label="Phone" value={profile.phone} />
            <ReadRow label="Official Email" value={profile.college_email} />
            <ReadRow label="Personal Email" value={profile.personal_email} />
            <ReadRow label="Gender" value={profile.gender} />
            <ReadRow label="Date of Birth" value={profile.date_of_birth} />
            <ReadRow label="LinkedIn" value={profile.linkedin} />
            <ReadRow label="GitHub" value={profile.github} />
          </div>

          <SectionTitle>Location</SectionTitle>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5 text-[12.5px]">
            <ReadRow label="Home Address" value={profile.home_address} />
            <ReadRow label="Current Residence" value={profile.current_residence} />
            <ReadRow label="Current Location" value={profile.current_location} />
            <ReadRow label="Hometown" value={profile.hometown_location} />
          </div>

          <SectionTitle>Academics</SectionTitle>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5 text-[12.5px]">
            <ReadRow label="CGPA" value={profile.cgpa} />
            <ReadRow label="Backlogs" value={String(profile.backlogs)} />
            <ReadRow label="10th %" value={profile.tenth_percentage} />
            <ReadRow label="12th %" value={profile.twelfth_percentage} />
          </div>

          {(profile.achievements || profile.certifications) && (
            <>
              <SectionTitle>Achievements & Certifications</SectionTitle>
              <div className="mb-5 text-[12.5px] space-y-1.5">
                {profile.achievements && <p><span className="text-muted">Achievements: </span>{profile.achievements}</p>}
                {profile.certifications && <p><span className="text-muted">Certifications: </span>{profile.certifications}</p>}
              </div>
            </>
          )}

          <SectionTitle>Documents</SectionTitle>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {Object.entries(profile.documents_summary).map(([docType, info]) => (
              <div key={docType} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] ${info.uploaded ? "bg-success-50 text-[#065F46]" : "bg-danger-50 text-[#991B1B]"}`}>
                {info.uploaded ? <FileCheck2 size={14} /> : <FileX2 size={14} />}
                <span className="flex-1">{DOC_LABELS[docType]}</span>
                <span className="font-semibold">{info.uploaded ? `${info.count} uploaded` : "Not uploaded"}</span>
              </div>
            ))}
          </div>

          <SectionTitle>Remarks {remarks.length > 0 && <Pill color="neutral">{remarks.length}</Pill>}</SectionTitle>
          <div className="mb-3 space-y-2 max-h-36 overflow-y-auto">
            {remarks.length === 0 && <p className="text-xs text-muted-2">No remarks left yet.</p>}
            {remarks.map((r) => (
              <div key={r.id} className="bg-surface-2 rounded-lg px-3 py-2 text-[12px]">
                <p>{r.message}</p>
                <p className="text-[10.5px] text-muted-2 mt-1">
                  — {r.placement_manager_name || "Placement Manager"}, {new Date(r.created_at).toLocaleDateString("en-GB")}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="Add a remark — the student will see this in their notifications"
              className="flex-1 h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSendRemark(); } }}
            />
            <Button onClick={handleSendRemark} disabled={sending || !remarkText.trim()}>
              <Send size={14} /> {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-[11px] font-bold text-muted uppercase tracking-wide mb-2.5">{children}</div>;
}

function ReadRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <span className="text-muted">{label}: </span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}