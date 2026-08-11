"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHead } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { pmAuth } from "@/lib/auth";
import { api, ApiRequestError } from "@/lib/api";
import { uploadMyPhoto, deleteMyPhoto } from "@/lib/documents";
import { PhotoUploadModal } from "@/components/student/PhotoUploadModal";
import { ImageViewModal } from "@/components/ui/ImageViewModal";
import { Camera } from "lucide-react";

interface Me {
  id: string;
  email: string;
  role: string;
  full_name: string;
  phone: string;
  employee_id: string;
  profile_photo: string | null;
}

export default function PMProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [viewPhotoOpen, setViewPhotoOpen] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);

  useEffect(() => {
    api<Me>("/api/auth/me/")
      .then((data) => {
        setMe(data);
        setPhone(data.phone || "");
        setEmployeeId(data.employee_id || "");
      })
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    pmAuth.logout();
    router.push("/pm-login");
  }

  async function handlePhotoUpload(file: File) {
    const res = await uploadMyPhoto(file);
    setMe((m) => (m ? { ...m, profile_photo: res.profile_photo } : m));
  }

  async function handleRemovePhoto() {
    setRemovingPhoto(true);
    try {
      await deleteMyPhoto();
      setMe((m) => (m ? { ...m, profile_photo: null } : m));
    } finally {
      setRemovingPhoto(false);
    }
  }

  async function handleSave() {
    if (!phone.trim()) { setError("Phone number is required."); return; }
    setSaving(true); setError(""); setSaved(false);
    try {
      const updated = await api<Me>("/api/auth/me/", {
        method: "PATCH",
        body: JSON.stringify({ phone, employee_id: employeeId }),
      });
      setMe(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiRequestError ? "Could not save changes" : "Could not reach the server");
    } finally {
      setSaving(false);
    }
  }

  const initials = me?.full_name
    ? me.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "PM";

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-[13px] text-muted mt-1">Your Placement Manager account</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-success font-semibold">Saved ✓</span>}
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
        </div>
      </div>

      {loading && <Card className="text-center py-16 text-sm text-muted">Loading...</Card>}
      {error && <p className="text-xs text-danger mb-4">{error}</p>}

      {!loading && me && (
        <>
          <Card className="mb-5 flex items-center gap-5">
            <button onClick={() => setPhotoModalOpen(true)} className="relative w-20 h-20 flex-shrink-0 cursor-pointer group">
              {me.profile_photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={me.profile_photo} alt={me.full_name} className="w-20 h-20 rounded-full object-cover" />
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
              <h2 className="text-xl font-bold mb-1">{me.full_name || "Placement Manager"}</h2>
              <p className="text-[13px] text-muted">Placement Manager · T&P Cell, SAITM</p>
              <div className="flex items-center gap-3 mt-1">
                {me.profile_photo && (
                  <button onClick={() => setViewPhotoOpen(true)} className="text-[11.5px] text-primary font-semibold">View</button>
                )}
                <button onClick={() => setPhotoModalOpen(true)} className="text-[11.5px] text-primary font-semibold">Change</button>
                {me.profile_photo && (
                  <button onClick={handleRemovePhoto} disabled={removingPhoto} className="text-[11.5px] text-danger font-semibold disabled:opacity-50">
                    {removingPhoto ? "Removing..." : "Remove"}
                  </button>
                )}
              </div>
            </div>
          </Card>

          <Card className="mb-5">
            <CardHead title="Contact details" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full name" value={me.full_name} readOnly />
              <Field label="Official email" value={me.email} readOnly />
              <Field label="Phone" required value={phone} onChange={setPhone} />
              <Field label="Employee ID" value={employeeId} onChange={setEmployeeId} placeholder="Optional" />
            </div>
            <p className="text-[11px] text-muted mt-3">
              Name and email come from your account and can&apos;t be changed here. Phone is required; Employee ID is optional.
            </p>
          </Card>
        </>
      )}

      <Card className="bg-danger-50 border-danger-50">
        <h3 className="text-base font-bold text-danger mb-1">Logout</h3>
        <p className="text-xs text-muted mb-4">You can sign back in any time with your PM credentials</p>
        <Button className="bg-danger hover:bg-danger" onClick={handleLogout}>Log me out</Button>
      </Card>

      <PhotoUploadModal open={photoModalOpen} onClose={() => setPhotoModalOpen(false)} onUpload={handlePhotoUpload} />
      <ImageViewModal open={viewPhotoOpen} onClose={() => setViewPhotoOpen(false)} src={me?.profile_photo ?? null} alt={me?.full_name ?? "Profile photo"} />
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, readOnly = false, required = false,
}: { label: string; value: string; onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label} {required && <span className="text-danger">*</span>}</label>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary ${readOnly ? "bg-surface-2 text-muted" : ""}`}
      />
    </div>
  );
}