"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { fetchInviteInfo, completeRegistration, InviteInfo } from "@/lib/invite";
import { ApiRequestError } from "@/lib/api";
import { CheckCircle2, XCircle } from "lucide-react";

const courseOptions = [
  "B.Tech - Computer Science Engineering", "B.Tech - Computer Science and Technology",
  "B.Tech - Computer Science Engineering (AI-ML)", "B.Tech - Mechanical Engineering",
  "B.Tech - Electronics and Telecommunication", "B.Tech - Civil Engineering", "B.Tech - Data Science",
  "BCA (Bachelor of Computer Application)", "BBA (Bachelor of Business Administration)",
  "MBA (Masters of Business Administration) - Human Resource", "MBA (Masters of Business Administration) - Finance",
  "MBA (Masters of Business Administration) - Sales & Marketing", "MBA (Masters of Business Administration) - Business Analytics",
  "MCA", "MTECH", "D.Pharma",
];
const batchOptions = ["2025", "2026", "2027", "2028"];

export default function CompleteRegistrationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    password: "", confirmPassword: "", phone: "", personalEmail: "",
    homeAddress: "", currentResidence: "", course: courseOptions[0], batch: batchOptions[0],
    cgpa: "", backlogs: "0", tenthPercentage: "", twelfthPercentage: "",
    achievements: "", certifications: "", linkedin: "", github: "",
  });

  useEffect(() => {
    fetchInviteInfo(token)
      .then((data) => {
        setInfo(data);
        setForm((f) => ({ ...f, phone: data.phone || "" }));
      })
      .catch((err) => {
        setLoadError(err instanceof ApiRequestError ? String(err.body.detail || "This invite link isn't valid.") : "Could not reach the server.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  function validate(): string | null {
    if (!form.password || form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords don't match.";
    if (!form.homeAddress.trim()) return "Home address is required.";
    if (!form.currentResidence.trim()) return "Current residence is required.";
    if (!form.tenthPercentage.trim()) return "10th percentage is required.";
    if (!form.twelfthPercentage.trim()) return "12th percentage is required.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    setSubmitting(true);
    try {
      await completeRegistration(token, {
        password: form.password,
        phone: form.phone,
        personal_email: form.personalEmail,
        home_address: form.homeAddress,
        current_residence: form.currentResidence,
        course: form.course,
        batch: form.batch,
        cgpa: form.cgpa,
        backlogs: Number(form.backlogs) || 0,
        tenth_percentage: form.tenthPercentage,
        twelfth_percentage: form.twelfthPercentage,
        achievements: form.achievements,
        certifications: form.certifications,
        linkedin: form.linkedin,
        github: form.github,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiRequestError ? Object.values(err.body).flat().join(" ") || "Could not complete registration." : "Could not reach the server.");
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-center text-sm text-muted py-10">Loading your invite...</p>;

  if (loadError) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-danger-50 text-danger grid place-items-center mx-auto mb-4">
          <XCircle size={24} />
        </div>
        <h1 className="text-xl font-bold mb-2">Invite link not valid</h1>
        <p className="text-[13px] text-muted mb-6">{loadError}</p>
        <Link href="/login" className="text-primary font-semibold text-[13px]">Go to Login</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <CheckCircle2 size={18} className="text-success" />
        <h1 className="text-xl font-bold">Welcome, {info?.full_name}</h1>
      </div>
      <p className="text-[13px] text-muted mb-6">
        Roll No: <strong className="text-ink">{info?.roll_no}</strong> · {info?.college_email}
        <br />Set a password and finish your profile to get started.
      </p>

      <form onSubmit={handleSubmit} autoComplete="off">
        <SectionTitle>Set Your Password</SectionTitle>
        <div className="grid grid-cols-2 gap-3.5 mb-4">
          <TextField label="Password" required type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="At least 8 characters" autoComplete="new-password" />
          <TextField label="Confirm Password" required type="password" value={form.confirmPassword} onChange={(v) => setForm({ ...form, confirmPassword: v })} autoComplete="new-password" />
        </div>

        <SectionTitle>Contact & Academic Details</SectionTitle>
        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
          <TextField label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <TextField label="Personal Email" value={form.personalEmail} onChange={(v) => setForm({ ...form, personalEmail: v })} placeholder="you@gmail.com" />
        </div>
        <div className="mb-3.5">
          <TextField label="Home Address" required value={form.homeAddress} onChange={(v) => setForm({ ...form, homeAddress: v })} />
        </div>
        <div className="mb-3.5">
          <TextField label="Current Residence" required value={form.currentResidence} onChange={(v) => setForm({ ...form, currentResidence: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
          <SelectField label="Course" required value={form.course} onChange={(v) => setForm({ ...form, course: v })} options={courseOptions} />
          <SelectField label="Batch" required value={form.batch} onChange={(v) => setForm({ ...form, batch: v })} options={batchOptions} />
        </div>
        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
          <TextField label="10th Percentage" required value={form.tenthPercentage} onChange={(v) => setForm({ ...form, tenthPercentage: v })} />
          <TextField label="12th Percentage" required value={form.twelfthPercentage} onChange={(v) => setForm({ ...form, twelfthPercentage: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3.5 mb-5">
          <TextField label="Current CGPA" value={form.cgpa} onChange={(v) => setForm({ ...form, cgpa: v })} placeholder="Optional" />
          <TextField label="Active Backlogs" value={form.backlogs} onChange={(v) => setForm({ ...form, backlogs: v })} placeholder="0" />
        </div>

        {error && <p className="text-xs text-danger mb-3">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full justify-center h-11">
          {submitting ? "Setting up your account..." : "Complete Registration"}
        </Button>
      </form>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold text-muted uppercase tracking-wide mb-3 pt-3 border-t border-border-soft first:pt-0 first:border-0">{children}</div>;
}

function TextField({
  label, value, onChange, placeholder, type = "text", required = false, autoComplete = "off",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label} {required && <span className="text-danger">*</span>}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
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
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}