"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { updateDrive, AdminDrive } from "@/lib/adminDrives";
import { courseOptions } from "@/lib/students";
import { X } from "lucide-react";

export function DriveEditModal({
  drive, open, onClose, onSaved,
}: { drive: AdminDrive | null; open: boolean; onClose: () => void; onSaved: (d: AdminDrive) => void }) {
  const [companyName, setCompanyName] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [ctc, setCtc] = useState("");
  const [jdText, setJdText] = useState("");
  const [profiles, setProfiles] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [batchInput, setBatchInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (drive) {
      setCompanyName(drive.company_name);
      setJobLocation(drive.job_location);
      setCtc(drive.ctc);
      setJdText(drive.jd_text);
      setProfiles(drive.profiles_offered.join(", "));
      setCourses(drive.eligible_courses);
      setBatches(drive.eligible_batches);
      setError("");
    }
  }, [drive]);

  function toggleCourse(c: string) {
    setCourses((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }
  function addBatch() {
    const val = batchInput.trim();
    if (val && !batches.includes(val)) setBatches([...batches, val]);
    setBatchInput("");
  }
  function removeBatch(val: string) {
    setBatches(batches.filter((b) => b !== val));
  }

  async function handleSave() {
    if (!drive) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateDrive(drive.id, {
        company_name: companyName,
        job_location: jobLocation,
        ctc,
        jd_text: jdText,
        profiles_offered: profiles.split(",").map((p) => p.trim()).filter(Boolean),
        eligible_courses: courses,
        eligible_batches: batches,
      });
      onSaved(updated);
      onClose();
    } catch {
      setError("Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (!drive) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Edit — ${drive.company_name}`} width={640}>
      <div className="space-y-3.5">
        <Field label="Company Name" value={companyName} onChange={setCompanyName} />
        <Field label="Job Location" value={jobLocation} onChange={setJobLocation} />
        <Field label="CTC" value={ctc} onChange={setCtc} />
        <Field label="Profile(s) Offered (comma-separated)" value={profiles} onChange={setProfiles} />

        <div>
          <label className="block text-xs font-semibold text-ink-2 mb-1.5">Job Description</label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="w-full h-28 px-3.5 py-2.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-2 mb-2">Eligible Courses</label>
          <div className="flex flex-wrap gap-2">
            {courseOptions.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => toggleCourse(c)}
                className={`px-2.5 py-1.5 rounded-full text-[11.5px] font-semibold border transition-colors ${courses.includes(c) ? "bg-primary text-white border-primary" : "bg-white text-muted border-border hover:border-primary"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-2 mb-2">Eligible Batches</label>
          <div className="flex gap-2 mb-2.5">
            <input
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBatch(); } }}
              placeholder="e.g. 2027"
              className="h-9 px-3 rounded-[10px] border border-border text-[13px] w-28"
            />
            <Button type="button" variant="outline" onClick={addBatch}>+ Add</Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {batches.map((b) => (
              <span key={b} className="flex items-center gap-1.5 bg-primary-50 text-primary px-2.5 py-1 rounded-full text-[11.5px] font-semibold">
                {b}
                <button type="button" onClick={() => removeBatch(b)} className="hover:text-danger"><X size={11} /></button>
              </span>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}