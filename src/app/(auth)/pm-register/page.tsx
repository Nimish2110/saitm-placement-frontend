"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { pmAuth } from "@/lib/auth";
import { ApiRequestError } from "@/lib/api";
import { Clock } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PMRegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", employeeId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(): string | null {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email.trim() || !EMAIL_RE.test(form.email)) return "A valid official email is required.";
    if (!form.password || form.password.length < 8) return "Password must be at least 8 characters.";
    if (!form.phone.trim()) return "Phone number is required.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(""); setLoading(true);
    try {
      await pmAuth.register({
        full_name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        employee_id: form.employeeId || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? Object.values(err.body).flat().join(" ") || "Registration failed" : "Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-warning-50 text-warning grid place-items-center mx-auto mb-4">
          <Clock size={24} />
        </div>
        <h1 className="text-xl font-bold mb-2">Application submitted</h1>
        <p className="text-[13px] text-muted mb-6">
          Your registration as a Placement Manager is awaiting admin approval. You&apos;ll receive an email at{" "}
          <strong className="text-ink">{form.email}</strong> as soon as it&apos;s approved — then you can log in.
        </p>
        <Link href="/pm-login" className="text-primary font-semibold text-[13px]">Go to PM Login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Register as Placement Manager</h1>
      <p className="text-[13px] text-muted mb-6">Your application will be reviewed by an admin before you can log in</p>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="space-y-4">
          <Field label="Full name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your full name" />
          <Field label="Official email" required type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="placementmanager@saitm.ac.in" />
          <Field label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 98XXXXXXXX" />
          <Field label="Employee ID" value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v })} placeholder="Optional — if you have one" />
          <Field label="Password" required type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="At least 8 characters" autoComplete="new-password" />
        </div>
        {error && <p className="text-xs text-danger mt-3">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full justify-center h-11 mt-5">
          {loading ? "Submitting..." : "Submit for approval"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted mt-6">
        Already approved? <Link href="/pm-login" className="text-primary font-semibold">Login</Link>
      </p>
    </div>
  );
}

function Field({
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
        className="w-full h-11 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}