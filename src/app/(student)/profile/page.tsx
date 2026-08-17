"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHead } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { studentAuth } from "@/lib/auth";
import { api, ApiRequestError } from "@/lib/api";
import { courseOptions, batchOptions } from "@/lib/students";
import { DocType, StudentDocument, DOC_TYPE_LABELS, fetchDocuments, uploadDocument, deleteDocument, uploadMyPhoto, deleteMyPhoto } from "@/lib/documents";
import { PhotoUploadModal } from "@/components/student/PhotoUploadModal";
import { ImageViewModal } from "@/components/ui/ImageViewModal";
import { FileText, Trash2, ExternalLink, Upload, Camera } from "lucide-react";

const tabs = ["Personal details", "Academic details", "Achievements", "Documents", "Logout"] as const;
const MAX_DOCS_BY_TYPE: Record<DocType, number> = {
  resume: 5,
  aadhar: 1,
  tenth_marksheet: 1,
  twelfth_marksheet: 1,
};
const docTypes: DocType[] = ["resume", "aadhar", "tenth_marksheet", "twelfth_marksheet"];

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  college_email: string;
  personal_email: string;
  linkedin: string;
  github: string;
  home_address: string;
  current_residence: string;
  roll_no: string;
  course: string;
  batch: string;
  cgpa: string | null;
  backlogs: number;
  tenth_percentage: string;
  twelfth_percentage: string;
  achievements: string;
  certifications: string;
  profile_photo: string | null;
}

export default function ProfilePage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Personal details");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [viewPhotoOpen, setViewPhotoOpen] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api<Profile>("/api/students/me/")
      .then(setProfile)
      .catch(() => setError("Could not load your profile."))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    studentAuth.logout();
    router.push("/login");
  }

  async function handlePhotoUpload(file: File) {
    const res = await uploadMyPhoto(file);
    setProfile((p) => (p ? { ...p, profile_photo: res.profile_photo } : p));
  }

  async function handleRemovePhoto() {
    setRemovingPhoto(true);
    try {
      await deleteMyPhoto();
      setProfile((p) => (p ? { ...p, profile_photo: null } : p));
    } catch {
      setError("Could not remove photo.");
    } finally {
      setRemovingPhoto(false);
    }
  }

  async function saveAll() {
    if (!profile) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      await api("/api/students/me/mandatory/", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: profile.full_name, phone: profile.phone, college_email: profile.college_email,
          personal_email: profile.personal_email, home_address: profile.home_address,
          current_residence: profile.current_residence, course: profile.course, batch: profile.batch,
          roll_no: profile.roll_no, cgpa: profile.cgpa, backlogs: profile.backlogs,
        }),
      });
      await api("/api/students/me/optional/", {
        method: "PATCH",
        body: JSON.stringify({
          tenth_percentage: profile.tenth_percentage, twelfth_percentage: profile.twelfth_percentage,
          achievements: profile.achievements, certifications: profile.certifications,
          linkedin: profile.linkedin, github: profile.github,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiRequestError ? "Could not save changes" : "Could not reach the server");
    } finally { setSaving(false); }
  }

  const initials = profile?.full_name ? profile.full_name[0].toUpperCase() : "S";

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-[13px] text-muted mt-1">Personal, academic, and achievement details</p>
        </div>
        {tab !== "Logout" && tab !== "Documents" && (
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-success font-semibold">Saved ✓</span>}
            <Button onClick={saveAll} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </div>
        )}
      </div>

      {loading && <Card className="text-center py-16 text-sm text-muted">Loading...</Card>}
      {error && <p className="text-xs text-danger mb-4">{error}</p>}

      {!loading && profile && (
        <>
          <Card className="mb-5 flex items-center gap-5">
            <button onClick={() => setPhotoModalOpen(true)} className="relative w-20 h-20 flex-shrink-0 cursor-pointer group">
              {profile.profile_photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profile_photo} alt={profile.full_name} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent text-white grid place-items-center text-3xl font-bold">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
                <Camera size={18} className="text-white" />
              </div>
            </button>
            <div>
              <h2 className="text-xl font-bold mb-1">{profile.full_name || "Your name"}</h2>
              <p className="text-[13px] text-muted">{profile.roll_no} · {profile.course} · Batch {profile.batch}</p>
              <div className="flex items-center gap-3 mt-1">
                {profile.profile_photo && (
                  <button onClick={() => setViewPhotoOpen(true)} className="text-[11.5px] text-primary font-semibold">View</button>
                )}
                <button onClick={() => setPhotoModalOpen(true)} className="text-[11.5px] text-primary font-semibold">Change</button>
                {profile.profile_photo && (
                  <button onClick={handleRemovePhoto} disabled={removingPhoto} className="text-[11.5px] text-danger font-semibold disabled:opacity-50">
                    {removingPhoto ? "Removing..." : "Remove"}
                  </button>
                )}
              </div>
            </div>
          </Card>

          <div className="flex gap-1 bg-white border border-border rounded-[10px] p-1 mb-5 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
                  tab === t ? (t === "Logout" ? "bg-danger text-white font-semibold" : "bg-primary text-white font-semibold") : "text-muted hover:bg-surface-2"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Personal details" && (
            <Card>
              <CardHead title="Personal information" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full name" required value={profile.full_name} onChange={(v) => setProfile({ ...profile, full_name: v })} />
                <Field label="Phone number" required value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
                <Field label="Official email" required value={profile.college_email} onChange={(v) => setProfile({ ...profile, college_email: v })} />
                <Field label="Personal email" required value={profile.personal_email} onChange={(v) => setProfile({ ...profile, personal_email: v })} />
                <Field label="LinkedIn" value={profile.linkedin} onChange={(v) => setProfile({ ...profile, linkedin: v })} placeholder="linkedin.com/in/..." />
                <Field label="GitHub" value={profile.github} onChange={(v) => setProfile({ ...profile, github: v })} placeholder="github.com/..." />
                <div className="col-span-2"><Field label="Home address" value={profile.home_address} onChange={(v) => setProfile({ ...profile, home_address: v })} /></div>
                <div className="col-span-2"><Field label="Current residence" value={profile.current_residence} onChange={(v) => setProfile({ ...profile, current_residence: v })} /></div>
              </div>
            </Card>
          )}

          {tab === "Academic details" && (
            <Card>
              <CardHead title="Academic information" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Roll number" required value={profile.roll_no} onChange={(v) => setProfile({ ...profile, roll_no: v })} />
                <SelectField label="Course" required value={profile.course} onChange={(v) => setProfile({ ...profile, course: v })} options={courseOptions} />
                <SelectField label="Batch" required value={profile.batch} onChange={(v) => setProfile({ ...profile, batch: v })} options={batchOptions} />
                <Field label="Current CGPA" value={profile.cgpa ?? ""} onChange={(v) => setProfile({ ...profile, cgpa: v })} />
                <Field label="Active backlogs" value={String(profile.backlogs)} onChange={(v) => setProfile({ ...profile, backlogs: Number(v) || 0 })} />
              </div>
            </Card>
          )}

          {tab === "Achievements" && (
            <Card>
              <CardHead title="Achievements & certifications" />
              <div className="space-y-4">
                <Field label="10th percentage" required value={profile.tenth_percentage} onChange={(v) => setProfile({ ...profile, tenth_percentage: v })} />
                <Field label="12th percentage" required value={profile.twelfth_percentage} onChange={(v) => setProfile({ ...profile, twelfth_percentage: v })} />
                <div>
                  <label className="block text-xs font-semibold text-ink-2 mb-1.5">Achievements</label>
                  <textarea value={profile.achievements} onChange={(e) => setProfile({ ...profile, achievements: e.target.value })} className="w-full h-20 px-3.5 py-2.5 rounded-[10px] border border-border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-2 mb-1.5">Certifications</label>
                  <textarea value={profile.certifications} onChange={(e) => setProfile({ ...profile, certifications: e.target.value })} className="w-full h-20 px-3.5 py-2.5 rounded-[10px] border border-border text-sm" />
                </div>
              </div>
            </Card>
          )}

          {tab === "Documents" && (
            <Card>
              <CardHead title="My Documents" />
              <p className="text-xs text-muted mb-5 -mt-2">
                Save up to 5 resumes, and 1 each of Aadhar Card / 10th / 12th Marksheet — reuse them instantly when applying to a drive instead of re-uploading every time.
              </p>
              <div className="space-y-6">
                {docTypes.map((dt) => (
                  <DocumentSection key={dt} docType={dt} />
                ))}
              </div>
            </Card>
          )}

          {tab === "Logout" && (
            <Card className="bg-danger-50 border-danger-50">
              <h3 className="text-base font-bold text-danger mb-1">Logout</h3>
              <p className="text-xs text-muted mb-4">You can sign back in any time with your SAITM credentials</p>
              <Button className="bg-danger hover:bg-danger" onClick={handleLogout}>Log me out</Button>
            </Card>
          )}
        </>
      )}

      <PhotoUploadModal open={photoModalOpen} onClose={() => setPhotoModalOpen(false)} onUpload={handlePhotoUpload} />
      <ImageViewModal open={viewPhotoOpen} onClose={() => setViewPhotoOpen(false)} src={profile?.profile_photo ?? null} alt={profile?.full_name ?? "Profile photo"} />
    </div>
  );
}

function DocumentSection({ docType }: { docType: DocType }) {
  const [docs, setDocs] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const maxDocs = MAX_DOCS_BY_TYPE[docType];

  function load() {
    setLoading(true);
    fetchDocuments(docType)
      .then(setDocs)
      .catch(() => setError("Could not load."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docType]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      await uploadDocument(docType, file);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.body.detail || "Upload failed" : "Could not reach the server");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDocument(id);
      load();
    } catch {
      setError("Could not remove that document.");
    }
  }

  return (
    <div className="border border-border rounded-[10px] p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold">{DOC_TYPE_LABELS[docType]}</h4>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted">{docs.length}/{maxDocs}</span>
          <label className={`text-xs font-semibold text-primary cursor-pointer ${docs.length >= maxDocs || uploading ? "opacity-40 pointer-events-none" : ""}`}>
            <Upload size={12} className="inline mr-1" />
            {uploading ? "Uploading..." : "Upload"}
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} disabled={docs.length >= maxDocs || uploading} />
          </label>
        </div>
      </div>

      {error && <p className="text-[11px] text-danger mb-2">{error}</p>}
      {loading && <p className="text-xs text-muted">Loading...</p>}

      {!loading && docs.length === 0 && <p className="text-xs text-muted-2">Nothing uploaded yet.</p>}

      {!loading && docs.length > 0 && (
        <div className="space-y-1.5">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-2.5 bg-surface-2 rounded-lg px-3 py-2">
              <FileText size={14} className="text-muted flex-shrink-0" />
              <span className="text-xs flex-1 truncate">{d.original_filename}</span>
              <a href={d.file} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary flex-shrink-0">
                <ExternalLink size={13} />
              </a>
              <button onClick={() => handleDelete(d.id)} className="text-muted hover:text-danger flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label} {required && <span className="text-danger">*</span>}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary" />
    </div>
  );
}

function SelectField({ label, value, onChange, options, required = false }: { label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label} {required && <span className="text-danger">*</span>}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm">
        {!value && <option value="">-- Select --</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}