"use client";

import { useEffect, useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useDriveStore, Drive } from "@/lib/notifications";
import { courseOptions, batchOptions } from "@/lib/students";
import { DocType, StudentDocument, fetchDocuments } from "@/lib/documents";
import { ExternalLink, AlertCircle, ChevronDown } from "lucide-react";

interface StudentProfileData {
  full_name: string;
  roll_no: string;
  phone: string;
  college_email: string;
  course: string;
  batch: string;
  gender: string;
  date_of_birth: string | null;
  tenth_percentage: string;
  tenth_board: string;
  tenth_year_of_passing: string;
  twelfth_percentage: string;
  twelfth_board: string;
  twelfth_year_of_passing: string;
  graduation_course: string;
  graduation_percentage: string;
  current_semester_percentage: string;
  backlogs: number;
  has_education_gap: boolean | null;
  current_location: string;
  hometown_location: string;
  has_internship_experience: boolean | null;
  internship_months: number | null;
}

const emptyForm = {
  full_name: "",
  roll_no: "",
  phone: "",
  college_email: "",
  course: "",
  batch: "",
  gender: "",
  date_of_birth: "",
  tenth_percentage: "",
  tenth_board: "",
  tenth_year_of_passing: "",
  twelfth_percentage: "",
  twelfth_board: "",
  twelfth_year_of_passing: "",
  graduation_course: "",
  graduation_percentage: "",
  current_semester_percentage: "",
  backlogsSelect: "0",
  backlogsOther: "",
  has_education_gap: "",
  current_location: "",
  hometown_location: "",
  has_internship_experience: "",
  internship_months: "",
  campus_name: "",
  aadhar_no: "",
};

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) return "Only PDF, JPG, or PNG files are accepted.";
  if (file.size > MAX_FILE_SIZE) return "File must be under 10 MB.";
  return null;
}

interface FileSelection {
  file: File | null;
  fromProfile: boolean;
}

const emptyFileSelection: FileSelection = { file: null, fromProfile: false };

export function ApplicationFormModal({
  drive,
  open,
  onClose,
}: {
  drive: Drive | null;
  open: boolean;
  onClose: () => void;
}) {
  const submitApplication = useDriveStore((s) => s.submitApplication);

  const [identity, setIdentity] = useState<StudentProfileData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [aadhar, setAadhar] = useState<FileSelection>(emptyFileSelection);
  const [resume, setResume] = useState<FileSelection>(emptyFileSelection);
  const [fileError, setFileError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setSuccess(false);
    setFileError("");
    setAadhar(emptyFileSelection);
    setResume(emptyFileSelection);

    api<StudentProfileData>("/api/students/me/").then((profile) => {
      setIdentity(profile);
      setForm({
        full_name: profile.full_name || "",
        roll_no: profile.roll_no || "",
        phone: profile.phone || "",
        college_email: profile.college_email || "",
        course: profile.course || "",
        batch: profile.batch || "",
        gender: profile.gender || "",
        date_of_birth: profile.date_of_birth || "",
        tenth_percentage: profile.tenth_percentage || "",
        tenth_board: profile.tenth_board || "",
        tenth_year_of_passing: profile.tenth_year_of_passing || "",
        twelfth_percentage: profile.twelfth_percentage || "",
        twelfth_board: profile.twelfth_board || "",
        twelfth_year_of_passing: profile.twelfth_year_of_passing || "",
        graduation_course: profile.graduation_course || "",
        graduation_percentage: profile.graduation_percentage || "",
        current_semester_percentage: profile.current_semester_percentage || "",
        backlogsSelect: profile.backlogs <= 3 ? String(profile.backlogs) : "Other",
        backlogsOther: profile.backlogs > 3 ? String(profile.backlogs) : "",
        has_education_gap: profile.has_education_gap === null ? "" : profile.has_education_gap ? "Yes" : "No",
        current_location: profile.current_location || "",
        hometown_location: profile.hometown_location || "",
        has_internship_experience:
          profile.has_internship_experience === null ? "" : profile.has_internship_experience ? "Yes" : "No",
        internship_months: profile.internship_months ? String(profile.internship_months) : "",
        campus_name: "",
        aadhar_no: "",
      });
    }).catch(() => {
      setError("Could not load your profile. Please close this and try again — if it keeps happening, log out and log back in.");
    });
  }, [open, drive?.id]);

  function clearForm() {
    setForm(emptyForm);
    setAadhar(emptyFileSelection);
    setResume(emptyFileSelection);
    setFileError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!drive) return;
    setError("");

    if (!aadhar.file || !resume.file) {
      setError("Both Aadhar card and Resume uploads are required.");
      return;
    }

    const backlogs = form.backlogsSelect === "Other" ? form.backlogsOther : form.backlogsSelect;

    const fd = new FormData();
    fd.append("campus_name", form.campus_name);
    fd.append("aadhar_no", form.aadhar_no);
    fd.append("aadhar_file", aadhar.file);
    fd.append("resume_file", resume.file);
    fd.append("save_aadhar_to_profile", String(!aadhar.fromProfile));
    fd.append("save_resume_to_profile", String(!resume.fromProfile));
    fd.append("full_name", form.full_name);
    fd.append("roll_no", form.roll_no);
    fd.append("phone", form.phone);
    fd.append("college_email", form.college_email);
    fd.append("course", form.course);
    fd.append("batch", form.batch);
    fd.append("gender", form.gender);
    fd.append("date_of_birth", form.date_of_birth);
    fd.append("tenth_percentage", form.tenth_percentage);
    fd.append("tenth_board", form.tenth_board);
    fd.append("tenth_year_of_passing", form.tenth_year_of_passing);
    fd.append("twelfth_percentage", form.twelfth_percentage);
    fd.append("twelfth_board", form.twelfth_board);
    fd.append("twelfth_year_of_passing", form.twelfth_year_of_passing);
    fd.append("graduation_course", form.graduation_course);
    fd.append("graduation_percentage", form.graduation_percentage);
    fd.append("current_semester_percentage", form.current_semester_percentage);
    fd.append("backlogs", backlogs);
    fd.append("has_education_gap", form.has_education_gap === "Yes" ? "true" : "false");
    fd.append("current_location", form.current_location);
    fd.append("hometown_location", form.hometown_location);
    fd.append("has_internship_experience", form.has_internship_experience === "Yes" ? "true" : "false");
    if (form.has_internship_experience === "Yes") {
      fd.append("internship_months", form.internship_months);
    }

    setSubmitting(true);
    const result = await submitApplication(drive.id, fd);
    setSubmitting(false);

    if (result.ok) {
      setSuccess(true);
      if (!drive.company_link) {
        setTimeout(() => onClose(), 1400);
      }
    } else {
      setError(result.message);
    }
  }

  if (!drive) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Apply — ${drive.company_name}`} width={720}>
      {success ? (
        <div className="text-center py-10">
          <div className="text-success text-3xl mb-2">✓</div>
          <h3 className="text-lg font-bold mb-1">Application submitted!</h3>
          <p className="text-sm text-muted mb-5">Your application to {drive.company_name} has been recorded.</p>
          {drive.company_link && (
            <>
              <Button
                onClick={() => window.open(drive.company_link, "_blank", "noopener,noreferrer")}
                className="mb-3"
              >
                Apply on Company Portal too <ExternalLink size={13} />
              </Button>
              <p className="text-[11px] text-muted mb-4">This company also requires their own portal — it&apos;s on you to complete it.</p>
            </>
          )}
          <div>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} autoComplete="off">
          {identity && (
            <>
              <SectionTitle>Your Details <span className="text-muted-2 font-normal normal-case tracking-normal">(pre-filled — edit if anything&apos;s outdated)</span></SectionTitle>
              <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                <TextField label="Full Name" required value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
                <TextField label="Roll Number" required value={form.roll_no} onChange={(v) => setForm({ ...form, roll_no: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                <TextField label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <TextField label="Email" type="email" required value={form.college_email} onChange={(v) => setForm({ ...form, college_email: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3.5 mb-5">
                <SelectField label="Course" required value={form.course} onChange={(v) => setForm({ ...form, course: v })} options={courseOptions} />
                <SelectField label="Batch" required value={form.batch} onChange={(v) => setForm({ ...form, batch: v })} options={batchOptions} />
              </div>
            </>
          )}

          <SectionTitle>Personal & Academic Details</SectionTitle>
          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            <SelectField label="Gender" required value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={["Male", "Female", "Prefer not to say"]} />
            <TextField label="Date of Birth" type="date" required value={form.date_of_birth} onChange={(v) => setForm({ ...form, date_of_birth: v })} />
          </div>

          <div className="grid grid-cols-3 gap-3.5 mb-3.5">
            <TextField label="10th Percentage" required value={form.tenth_percentage} onChange={(v) => setForm({ ...form, tenth_percentage: v })} />
            <TextField label="10th Board" required value={form.tenth_board} onChange={(v) => setForm({ ...form, tenth_board: v })} />
            <TextField label="10th Year of Passing" required value={form.tenth_year_of_passing} onChange={(v) => setForm({ ...form, tenth_year_of_passing: v })} />
          </div>

          <div className="grid grid-cols-3 gap-3.5 mb-3.5">
            <TextField label="12th/Diploma %" required value={form.twelfth_percentage} onChange={(v) => setForm({ ...form, twelfth_percentage: v })} />
            <TextField label="12th Board" required value={form.twelfth_board} onChange={(v) => setForm({ ...form, twelfth_board: v })} />
            <TextField label="12th Year of Passing" value={form.twelfth_year_of_passing} onChange={(v) => setForm({ ...form, twelfth_year_of_passing: v })} />
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            <TextField label="Graduation Course" value={form.graduation_course} onChange={(v) => setForm({ ...form, graduation_course: v })} />
            <TextField label="Graduation Percentage" value={form.graduation_percentage} onChange={(v) => setForm({ ...form, graduation_percentage: v })} />
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            <TextField label="Percentage till current semester" required value={form.current_semester_percentage} onChange={(v) => setForm({ ...form, current_semester_percentage: v })} />
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">No. of Active Backlogs <span className="text-danger">*</span></label>
              <div className="flex gap-2">
                <select
                  value={form.backlogsSelect}
                  onChange={(e) => setForm({ ...form, backlogsSelect: e.target.value })}
                  className="h-10 px-3 rounded-[10px] border border-border text-sm flex-1"
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="Other">Other</option>
                </select>
                {form.backlogsSelect === "Other" && (
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter number"
                    value={form.backlogsOther}
                    onChange={(e) => setForm({ ...form, backlogsOther: e.target.value })}
                    className="h-10 px-3 rounded-[10px] border border-border text-sm w-28"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            <SelectField label="Any Education Gap?" required value={form.has_education_gap} onChange={(v) => setForm({ ...form, has_education_gap: v })} options={["Yes", "No"]} />
            <div />
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            <TextField label="Current Location (State & City)" required value={form.current_location} onChange={(v) => setForm({ ...form, current_location: v })} />
            <TextField label="Hometown Location (State & City)" required value={form.hometown_location} onChange={(v) => setForm({ ...form, hometown_location: v })} />
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-5">
            <SelectField label="Any Internship Experience?" required value={form.has_internship_experience} onChange={(v) => setForm({ ...form, has_internship_experience: v })} options={["Yes", "No"]} />
            {form.has_internship_experience === "Yes" && (
              <TextField label="If Yes, how many months?" type="number" required value={form.internship_months} onChange={(v) => setForm({ ...form, internship_months: v })} />
            )}
          </div>

          <SectionTitle>Application-specific (re-enter every time)</SectionTitle>
          <div className="grid grid-cols-2 gap-3.5 mb-4">
            <SelectField label="Campus Name" required value={form.campus_name} onChange={(v) => setForm({ ...form, campus_name: v })} options={["SAITM, Gurgaon", "SAITM, Delhi"]} />
            <TextField label="Aadhar No." required value={form.aadhar_no} onChange={(v) => setForm({ ...form, aadhar_no: v })} />
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-3">
            <FileSourcePicker label="Upload Aadhar Card" required docType="aadhar" selection={aadhar} onSelect={setAadhar} onError={setFileError} />
            <FileSourcePicker label="Upload Resume" required docType="resume" selection={resume} onSelect={setResume} onError={setFileError} />
          </div>
          <p className="text-[10.5px] text-muted mb-4">PDF, JPG, or PNG only · Max 10 MB each</p>

          {fileError && (
            <div className="flex items-center gap-2 bg-danger-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-[12px] text-danger">
              <AlertCircle size={14} /> {fileError}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-danger-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-[12px] text-danger">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-end pt-3 border-t border-border">
            {drive.company_link && (
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(drive.company_link, "_blank", "noopener,noreferrer")}
                className="mr-auto"
              >
                Company Apply Link (Mandatory) <ExternalLink size={13} />
              </Button>
            )}
            <Button type="button" variant="outline" onClick={clearForm}>Clear form</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function FileSourcePicker({
  label, required = false, docType, selection, onSelect, onError,
}: {
  label: string;
  required?: boolean;
  docType: DocType;
  selection: FileSelection;
  onSelect: (s: FileSelection) => void;
  onError: (msg: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [libraryDocs, setLibraryDocs] = useState<StudentDocument[] | null>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [fetchingPick, setFetchingPick] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    setPickerOpen((v) => !v);
    if (!libraryDocs) {
      setLoadingLibrary(true);
      fetchDocuments(docType)
        .then(setLibraryDocs)
        .catch(() => onError("Could not load your saved documents."))
        .finally(() => setLoadingLibrary(false));
    }
  }

  async function handlePickFromProfile(doc: StudentDocument) {
    setFetchingPick(true);
    try {
      const res = await fetch(doc.file);
      const blob = await res.blob();
      const file = new File([blob], doc.original_filename || `${docType}.pdf`, { type: blob.type });
      onError("");
      onSelect({ file, fromProfile: true });
      setPickerOpen(false);
    } catch {
      onError("Could not load that saved file — try Browse PC instead.");
    } finally {
      setFetchingPick(false);
    }
  }

  function handleBrowseChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (file) {
      const err = validateFile(file);
      if (err) { onError(err); return; }
    }
    onError("");
    onSelect({ file, fromProfile: false });
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label} {required && <span className="text-danger">*</span>}</label>
      <div className="relative">
        <div className="flex gap-1.5">
          <Button type="button" variant="outline" size="sm" onClick={openPicker} className="flex-1 justify-center">
            Take from Profile <ChevronDown size={12} />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1 justify-center">
            Browse PC
          </Button>
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleBrowseChange} />
        </div>

        {pickerOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
            {loadingLibrary && <p className="text-xs text-muted p-3">Loading...</p>}
            {!loadingLibrary && libraryDocs?.length === 0 && <p className="text-xs text-muted p-3">No saved documents yet — upload one from your Profile, or use Browse PC.</p>}
            {!loadingLibrary && libraryDocs?.map((doc) => (
              <button
                key={doc.id}
                type="button"
                disabled={fetchingPick}
                onClick={() => handlePickFromProfile(doc)}
                className="w-full text-left text-xs px-3 py-2 hover:bg-surface-2 truncate disabled:opacity-50"
              >
                {doc.original_filename}
              </button>
            ))}
          </div>
        )}
      </div>
      {selection.file && (
        <p className="text-[11px] text-success mt-1">{selection.file.name}{selection.fromProfile ? " (from profile)" : ""}</p>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold text-muted uppercase tracking-wide mb-3 pt-3 border-t border-border-soft first:pt-0 first:border-0">{children}</div>;
}

function TextField({
  label, value, onChange, type = "text", required = false,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label} {required && <span className="text-danger">*</span>}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options, required = false,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label} {required && <span className="text-danger">*</span>}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm">
        <option value="">Select...</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}