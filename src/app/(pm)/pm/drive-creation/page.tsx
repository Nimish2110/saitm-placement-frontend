"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Info, X } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";
import { courseOptions } from "@/lib/students";
import { STATE_CITY_MAP, stateOptions } from "@/lib/locations";
import { JDFileUpload, JDFileUploadHandle } from "@/components/placements/JDFileUpload";

const driveTypeOptions = ["Final Placement", "Internship", "Pre-Placement Offer (PPO)"];

interface CtcState {
  mode: "fixed" | "range";
  unit: "Thousand" | "Lakh";
  fixed: string;
  min: string;
  max: string;
}

interface LocationEntry {
  city: string;
  state: string;
}

const emptyInternshipCtc: CtcState = { mode: "fixed", unit: "Thousand", fixed: "", min: "", max: "" };
const emptyPlacementCtc: CtcState = { mode: "fixed", unit: "Lakh", fixed: "", min: "", max: "" };

function formatAmount(val: string, unit: "Thousand" | "Lakh") {
  const suffix = unit === "Thousand" ? "K" : "L";
  return `₹${val}${suffix}`;
}

function formatCtcSection(data: CtcState): string {
  if (data.mode === "range") {
    if (!data.min && !data.max) return "";
    return `${formatAmount(data.min, data.unit)} - ${formatAmount(data.max, data.unit)}`;
  }
  if (!data.fixed) return "";
  return formatAmount(data.fixed, data.unit);
}

export default function DriveCreationPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const jdUploadRef = useRef<JDFileUploadHandle>(null);

  const [driveTypes, setDriveTypes] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [profiles, setProfiles] = useState("");

  const [jdText, setJdText] = useState("");
  const [jdModalOpen, setJdModalOpen] = useState(false);

  const [locations, setLocations] = useState<LocationEntry[]>([{ city: "", state: "" }]);

  const [courses, setCourses] = useState<string[]>([]);

  const [batches, setBatches] = useState<string[]>([]);
  const [batchInput, setBatchInput] = useState("");

  const [internshipCtc, setInternshipCtc] = useState<CtcState>(emptyInternshipCtc);
  const [placementCtc, setPlacementCtc] = useState<CtcState>(emptyPlacementCtc);

  const [process, setProcess] = useState("");
  const [deadline, setDeadline] = useState("");
  const [companyLink, setCompanyLink] = useState("");
  const [pmNote, setPmNote] = useState("");

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function addBatch() {
    const val = batchInput.trim();
    if (val && !batches.includes(val)) {
      setBatches([...batches, val]);
    }
    setBatchInput("");
  }

  function removeBatch(val: string) {
    setBatches(batches.filter((b) => b !== val));
  }

  function updateLocation(index: number, field: "city" | "state", value: string) {
    setLocations((prev) => prev.map((loc, i) => (i === index ? { ...loc, [field]: value } : loc)));
  }
  function addLocationRow() {
    setLocations((prev) => [...prev, { city: "", state: "" }]);
  }
  function removeLocationRow(index: number) {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  }

  const driveTypeLabel = driveTypes.length > 0 ? driveTypes.join(" + ") : "";
  const allCityOptions = Array.from(new Set(Object.values(STATE_CITY_MAP).flat()));
  const jobLocation = locations
    .filter((l) => l.city.trim())
    .map((l) => (l.state.trim() ? `${l.city.trim()}, ${l.state.trim()}` : l.city.trim()))
    .join("; ");

  const showInternshipCtc = driveTypes.includes("Internship");
  const showPlacementCtc = driveTypes.includes("Final Placement") || driveTypes.includes("Pre-Placement Offer (PPO)");

  const ctcParts: string[] = [];
  if (showInternshipCtc) {
    const part = formatCtcSection(internshipCtc);
    if (part) ctcParts.push(`Internship: ${part}`);
  }
  if (showPlacementCtc) {
    const part = formatCtcSection(placementCtc);
    if (part) {
      const label = driveTypes.includes("Pre-Placement Offer (PPO)") ? "Pre Placement Offer" : "Final Placement";
      ctcParts.push(`${label}: ${part}`);
    }
  }
  const combinedCtc = ctcParts.join(" | ");

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const created = await api<{ id: string }>("/api/drives/", {
        method: "POST",
        body: JSON.stringify({
          drive_type: driveTypeLabel,
          company_name: companyName,
          company_website: companyWebsite,
          jd_text: jdText,
          profiles_offered: profiles.split(",").map((p) => p.trim()).filter(Boolean),
          job_location: jobLocation,
          eligible_courses: courses,
          eligible_batches: batches,
          ctc: combinedCtc,
          process_details: process,
          last_date_of_application: deadline ? new Date(`${deadline}T23:59:59`).toISOString() : null,
          company_link: companyLink,
          pm_note: pmNote,
        }),
      });

      if (jdUploadRef.current) {
        await jdUploadRef.current.uploadNow(created.id);
      }

      router.push("/pm/drives-floated");
    } catch (err) {
      setError(err instanceof ApiRequestError ? Object.values(err.body).flat().join(" ") || "Could not submit drive" : "Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Drive</h1>
        <p className="text-[13px] text-muted mt-1">Submit a placement drive for Admin review — it goes live to students only after approval</p>
      </div>

      <Card className="max-w-[820px]">
        <form onSubmit={handlePublish}>
          <SectionTitle first>Drive & Company</SectionTitle>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-2 mb-2">Type of Drive <span className="text-muted-2 font-normal">(select any combination)</span></label>
            <div className="flex flex-wrap gap-2">
              {driveTypeOptions.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggle(driveTypes, setDriveTypes, t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    driveTypes.includes(t) ? "bg-primary text-white border-primary" : "bg-white text-muted border-border hover:border-primary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {driveTypeLabel && <p className="text-[11px] text-muted mt-2">Will be submitted as: <strong className="text-ink">{driveTypeLabel}</strong></p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Company Name" value={companyName} onChange={setCompanyName} placeholder="e.g. ClearTax" required />
            <Field label="Company Website" value={companyWebsite} onChange={setCompanyWebsite} placeholder="https://cleartax.in/" />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Job Description</label>
            <Button type="button" variant="outline" onClick={() => setJdModalOpen(true)}>
              {jdText ? "Edit Job Description ✓" : "+ Add Job Description"}
            </Button>
            {jdText && <p className="text-[11px] text-muted mt-1.5">{jdText.length} characters written</p>}
          </div>

          <div className="mb-4">
            <JDFileUpload ref={jdUploadRef} />
          </div>

          <SectionTitle>Role Details</SectionTitle>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Profile(s) Offered <span className="text-muted-2 font-normal">(comma-separated)</span></label>
            <input
              value={profiles}
              onChange={(e) => setProfiles(e.target.value)}
              placeholder="Integration Engineer I, Technical Support Specialist I"
              className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-2 mb-2">
              Job Location(s) <span className="text-muted-2 font-normal">— add one per office; State is optional</span>
            </label>
            <div className="space-y-2.5">
              {locations.map((loc, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2.5">
                  <input
                    list="all-city-options"
                    value={loc.city}
                    onChange={(e) => updateLocation(i, "city", e.target.value)}
                    placeholder="City (e.g. Gurugram, Remote, Pan India)"
                    className="h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    list="state-options"
                    value={loc.state}
                    onChange={(e) => updateLocation(i, "state", e.target.value)}
                    placeholder="State (optional)"
                    className="h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeLocationRow(i)}
                    disabled={locations.length === 1}
                    className="h-10 w-10 rounded-[10px] border border-border text-muted hover:text-danger hover:border-red-200 disabled:opacity-30 flex-shrink-0 grid place-items-center"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <datalist id="all-city-options">
              {allCityOptions.map((c) => <option key={c} value={c} />)}
            </datalist>
            <datalist id="state-options">
              {stateOptions.map((s) => <option key={s} value={s} />)}
            </datalist>
            <Button type="button" variant="outline" onClick={addLocationRow} className="mt-2.5">
              + Add another location
            </Button>
            {jobLocation && <p className="text-[11px] text-muted mt-2">Will publish as: <strong className="text-ink">{jobLocation}</strong></p>}
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-ink-2 mb-2">
              CTC {combinedCtc && <span className="text-muted-2 font-normal">— will submit as: <strong className="text-ink">{combinedCtc}</strong></span>}
            </label>
            {!showInternshipCtc && !showPlacementCtc && (
              <p className="text-xs text-muted bg-surface-2 rounded-lg px-3 py-2.5">Select a Type of Drive above (Internship and/or Final Placement / PPO) to enter CTC details.</p>
            )}
            <div className="space-y-3">
              {showInternshipCtc && <CtcField label="Internship Stipend" value={internshipCtc} onChange={setInternshipCtc} />}
              {showPlacementCtc && <CtcField label="Pre-Placement CTC" value={placementCtc} onChange={setPlacementCtc} />}
            </div>
          </div>

          <SectionTitle>Eligibility</SectionTitle>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-2 mb-2">Eligible Courses</label>
            <div className="flex flex-wrap gap-2">
              {courseOptions.map((c) => (
                <button type="button" key={c} onClick={() => toggle(courses, setCourses, c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${courses.includes(c) ? "bg-primary text-white border-primary" : "bg-white text-muted border-border hover:border-primary"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-ink-2 mb-2">Eligible Batches</label>
            <div className="flex gap-2 mb-2.5">
              <input
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBatch(); } }}
                placeholder="e.g. 2026"
                className="h-10 px-3.5 rounded-[10px] border border-border text-sm w-32 focus:outline-none focus:border-primary"
              />
              <Button type="button" variant="outline" onClick={addBatch}>+ Add batch</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {batches.map((b) => (
                <span key={b} className="flex items-center gap-1.5 bg-primary-50 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                  {b}
                  <button type="button" onClick={() => removeBatch(b)} className="hover:text-danger">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {batches.length === 0 && <span className="text-xs text-muted">No batches added yet</span>}
            </div>
          </div>

          <SectionTitle>Process & Terms</SectionTitle>
          <div className="mb-4">
            <Field label="Process Details" value={process} onChange={setProcess} placeholder="e.g. 3 Interview Rounds" />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Last Date of Application</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Company Link <span className="text-muted-2 font-normal">(optional — only if the company needs students to also register on their own portal)</span></label>
            <input
              value={companyLink}
              onChange={(e) => setCompanyLink(e.target.value)}
              placeholder="https://company.com/careers/apply"
              className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
            />
            {companyLink && (
              <p className="text-[11px] text-warning mt-1.5">Remember to mention this in your Note below, e.g. &quot;Also fill up the company&apos;s link&quot;.</p>
            )}
          </div>
          <div className="mb-5">
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Note for students (optional)</label>
            <textarea
              value={pmNote}
              onChange={(e) => setPmNote(e.target.value)}
              placeholder="Any extra instructions — e.g. 'Also fill up the company's link after applying here.'"
              className="w-full h-20 px-3.5 py-2.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-2.5 bg-info-50 border border-blue-200 rounded-[10px] p-3.5 text-[12px] text-[#1E40AF] mb-5">
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <span>This drive will be sent to Admin for review first. Once Admin approves it, it goes live on the portal and every eligible student is notified automatically — you&apos;ll see its status on Drives Floated.</span>
          </div>

          {error && <p className="text-xs text-danger mb-3">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit for Approval"}</Button>
          </div>
        </form>
      </Card>

      <Modal open={jdModalOpen} onClose={() => setJdModalOpen(false)} title="Job Description" width={640}>
        <p className="text-xs text-muted mb-3">Paste or type the job description below. Students will see this exact text — no external link needed.</p>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-80 p-3.5 rounded-[10px] border border-border text-sm font-mono focus:outline-none focus:border-primary resize-none"
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={() => setJdText("")}>Clear</Button>
          <Button type="button" onClick={() => setJdModalOpen(false)}>Done</Button>
        </div>
      </Modal>
    </div>
  );
}

function SectionTitle({ children, first = false }: { children: React.ReactNode; first?: boolean }) {
  return <div className={`text-[11px] font-bold text-muted uppercase tracking-wide mb-3 ${first ? "" : "pt-4 mt-4 border-t border-border-soft"}`}>{children}</div>;
}

function Field({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary" />
    </div>
  );
}

function CtcField({ label, value, onChange }: { label: string; value: CtcState; onChange: (v: CtcState) => void }) {
  return (
    <div className="border border-border rounded-[10px] p-3.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-ink-2">{label}</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...value, mode: "fixed" })}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${value.mode === "fixed" ? "bg-primary text-white border-primary" : "bg-white text-muted border-border hover:border-primary"}`}
          >
            Fixed amount
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, mode: "range" })}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${value.mode === "range" ? "bg-primary text-white border-primary" : "bg-white text-muted border-border hover:border-primary"}`}
          >
            Range
          </button>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        {value.mode === "fixed" ? (
          <input
            type="number"
            min={0}
            value={value.fixed}
            onChange={(e) => onChange({ ...value, fixed: e.target.value })}
            placeholder="Amount"
            className="h-10 px-3 rounded-[10px] border border-border text-sm flex-1 focus:outline-none focus:border-primary"
          />
        ) : (
          <>
            <input
              type="number"
              min={0}
              value={value.min}
              onChange={(e) => onChange({ ...value, min: e.target.value })}
              placeholder="Min"
              className="h-10 px-3 rounded-[10px] border border-border text-sm flex-1 focus:outline-none focus:border-primary"
            />
            <span className="text-muted text-sm flex-shrink-0">to</span>
            <input
              type="number"
              min={0}
              value={value.max}
              onChange={(e) => onChange({ ...value, max: e.target.value })}
              placeholder="Max"
              className="h-10 px-3 rounded-[10px] border border-border text-sm flex-1 focus:outline-none focus:border-primary"
            />
          </>
        )}
        <select
          value={value.unit}
          onChange={(e) => onChange({ ...value, unit: e.target.value as "Thousand" | "Lakh" })}
          className="h-10 px-2.5 rounded-[10px] border border-border text-sm w-[104px] flex-shrink-0"
        >
          <option value="Thousand">Thousand</option>
          <option value="Lakh">Lakh</option>
        </select>
      </div>
    </div>
  );
}