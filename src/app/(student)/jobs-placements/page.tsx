"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Modal } from "@/components/ui/Modal";
import { useDriveStore, Drive } from "@/lib/notifications";
import { ApplicationFormModal } from "@/components/student/ApplicationFormModal";
import { JDFileList } from "@/components/placements/JDFileList";
import { Briefcase, ChevronDown, ChevronUp, CheckCircle2, StickyNote } from "lucide-react";

export default function JobsPlacementsPage() {
  const { drives, loading, error, appliedDriveIds, fetchDrives, fetchMyApplications } = useDriveStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applyDrive, setApplyDrive] = useState<Drive | null>(null);
  const [jdModalDrive, setJdModalDrive] = useState<Drive | null>(null);

  useEffect(() => {
    fetchDrives();
    fetchMyApplications();
  }, [fetchDrives, fetchMyApplications]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Jobs & Placements</h1>
        <p className="text-[13px] text-muted mt-1">Live placement drives from the T&P Cell</p>
      </div>

      {loading && <Card className="text-center py-16 text-sm text-muted">Loading drives...</Card>}
      {error && <Card className="text-center py-16 text-sm text-danger">{error}</Card>}

      {!loading && !error && (
        <div className="space-y-4">
          {drives.map((d) => {
            const expanded = expandedId === d.id;
            const applied = appliedDriveIds.has(d.id);

            return (
              <Card key={d.id} className="p-0 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-10 h-10 rounded-[10px] bg-primary-50 text-primary grid place-items-center flex-shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-[15px] font-bold">{d.company_name}</h3>
                        <Pill color="info">{d.drive_type}</Pill>
                        {applied && <Pill color="success"><CheckCircle2 size={11} className="inline mr-1" />Applied</Pill>}
                        {!d.is_eligible && !applied && <Pill color="neutral">Not for your course/batch</Pill>}
                      </div>
                      <p className="text-[12.5px] text-muted">{d.profiles_offered.join(" · ")}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-muted mb-3">
                    <span>📍 {d.job_location}</span>
                    <span>💰 {d.ctc}</span>
                    <span>⏰ Closes {new Date(d.last_date_of_application).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                  </div>

                  {!d.is_eligible && !applied && (
                    <div className="bg-surface-2 rounded-lg px-3 py-2 mb-3 text-[11.5px] text-muted">
                        This drive is open to a different course/batch than yours — visible so you know the company is on campus, but you can&apos;t apply.
                     </div>
                    )}

                  {d.pm_note && (
                    <div className="flex items-start gap-2 bg-warning-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 text-[11.5px] text-[#92400E]">
                      <StickyNote size={14} className="flex-shrink-0 mt-0.5" />
                      <span>{d.pm_note}</span>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Button disabled={applied || !d.is_eligible} onClick={() => setApplyDrive(d)} className="flex-1 justify-center min-w-[140px]">
                      {applied ? "Applied ✓" : !d.is_eligible ? "Not Eligible" : "Apply Now"}
                    </Button>
                    <Button variant="outline" onClick={() => setExpandedId(expanded ? null : d.id)}>
                      {expanded ? "Hide details" : "View details"}
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </Button>
                  </div>
                </div>

                {expanded && (
                  <div className="bg-surface-2 border-t border-border p-5">
                    <div className="bg-white border border-border rounded-[10px] p-5">
                      <h4 className="text-[13px] font-bold text-primary uppercase tracking-wide mb-3">Placements Update</h4>
                      <DetailRow label="Type of Drive" value={d.drive_type} />
                      <DetailRow label="Company Name" value={d.company_name} />
                      <DetailRow label="Company Website" value={d.company_website} link />
                      {d.jd_text && (
                      <div className="flex justify-between items-center gap-4 py-2 text-[12.5px] border-b border-border-soft">
                      <span className="text-muted">Job Description</span>
                      <Button type="button" size="sm" variant="outline" onClick={() => setJdModalDrive(d)}>Open JD</Button>
                      </div>
                      )}

                      <JDFileList files={d.jd_files} />

                      <DetailRow label="Profile(s) Offered" value={d.profiles_offered.join(", ")} />
                      <DetailRow label="Job Location" value={d.job_location} />
                      <DetailRow label="CTC" value={d.ctc} />
                      <DetailRow label="Process" value={d.process_details} />
                      <DetailRow label="Eligible Courses" value={d.eligible_courses.join(", ")} />
                      <DetailRow label="Eligible Batches" value={d.eligible_batches.join(", ")} />
                      <DetailRow label="Last Date of Application" value={new Date(d.last_date_of_application).toLocaleString("en-IN")} last={!d.pm_note && !d.company_link} />

                      {d.company_link && (
                        <DetailRow label="Company Portal (also required)" value={d.company_link} link last={!d.pm_note} />
                      )}

                      {d.pm_note && (
                        <div className="flex items-start gap-2.5 bg-warning-50 border border-amber-200 rounded-lg px-3.5 py-3 mt-3">
                          <StickyNote size={15} className="flex-shrink-0 mt-0.5 text-[#92400E]" />
                          <div>
                            <div className="text-[10.5px] font-bold text-[#92400E] uppercase tracking-wide mb-1">Note from Placement Manager</div>
                            <p className="text-[12px] text-[#92400E]">{d.pm_note}</p>
                          </div>
                        </div>
                      )}

                      <p className="text-[11.5px] text-muted italic mt-3 mb-4">
                        Read the Job Description carefully before applying. All the best!
                        <br />— {d.posted_by_name || "Placement Manager"}, T&P Cell, SAITM
                      </p>

                      <Button disabled={applied || !d.is_eligible} onClick={() => setApplyDrive(d)} className="w-full justify-center">
                        {applied ? "Applied ✓" : !d.is_eligible ? "Not Eligible" : "Apply Now"}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {drives.length === 0 && <Card className="text-center py-16 text-sm text-muted">No live placement drives right now.</Card>}
        </div>
      )}

      <ApplicationFormModal drive={applyDrive} open={!!applyDrive} onClose={() => setApplyDrive(null)} />
        <Modal open={!!jdModalDrive} onClose={() => setJdModalDrive(null)} title={`Job Description — ${jdModalDrive?.company_name ?? ""}`} width={640}>
        <textarea
        readOnly
        value={jdModalDrive?.jd_text ?? ""}
        className="w-full h-80 p-3.5 rounded-[10px] border border-border text-sm font-mono bg-surface-2 resize-none"
        />
      </Modal>
    </div>
  );
}

function DetailRow({ label, value, link = false, linkLabel, last = false }: { label: string; value: string; link?: boolean; linkLabel?: string; last?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-2 text-[12.5px] ${last ? "" : "border-b border-border-soft"}`}>
      <span className="text-muted flex-shrink-0">{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary font-medium text-right hover:underline">{linkLabel ?? value}</a>
      ) : (
        <span className="font-medium text-right">{value}</span>
      )}
    </div>
  );
}