"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHead } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fetchAdminStudents, bulkImportStudents, sendInvites, deleteStudent, AdminStudentRow } from "@/lib/adminStudents";
import { Upload, Send, Users, CheckCircle2, Clock, Loader2, Trash2 } from "lucide-react";

export default function AdminStudentDatabasePage() {
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    fetchAdminStudents()
      .then(setStudents)
      .catch(() => setError("Could not load student database."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const result = await bulkImportStudents(file);
      setMessage(result.detail);
      if (result.errors.length > 0) {
        setError(result.errors.join(" "));
      }
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed — check the file format and try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSendInvites() {
    if (!confirm("Send the invite link to every student who hasn't completed registration yet?")) return;
    setSending(true);
    setError("");
    setMessage("");
    try {
      const result = await sendInvites();
      setMessage(result.detail);
    } catch {
      setError("Could not send invites. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(student: AdminStudentRow) {
    if (!confirm(`Permanently delete ${student.full_name} (${student.roll_no})?\n\nThis removes their account, applications, documents, remarks, resumes, and assessment history — everywhere. This cannot be undone.`)) return;
    setDeletingId(student.id);
    setError("");
    setMessage("");
    try {
      await deleteStudent(student.id);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      setMessage(`${student.full_name} was deleted.`);
    } catch {
      setError("Could not delete this student. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const completedCount = students.filter((s) => s.registration_completed).length;
  const pendingCount = students.length - completedCount;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Database</h1>
          <p className="text-[13px] text-muted mt-1">Upload the registered-students Excel, then send everyone their invite link</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileSelected} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading..." : "Upload Students Data"}
          </Button>
          <Button onClick={handleSendInvites} disabled={sending || students.length === 0} className="bg-blue-600 hover:bg-blue-700">
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {sending ? "Sending..." : "Send Invite Link"}
          </Button>
        </div>
      </div>

      <p className="text-[11.5px] text-muted -mt-3 mb-5">
        The Excel file must have exactly 4 columns, in this order, with a header row: <strong>Name, Roll Number, College Email, Phone Number</strong>.
      </p>

      {message && <p className="text-xs text-success mb-3 bg-success-50 rounded-lg px-3 py-2">{message}</p>}
      {error && <p className="text-xs text-danger mb-3 bg-danger-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[10px] bg-primary-50 text-primary grid place-items-center flex-shrink-0"><Users size={20} /></div>
          <div><div className="text-xs text-muted">Total Students</div><div className="text-xl font-bold">{students.length}</div></div>
        </Card>
        <Card className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[10px] bg-success-50 text-success grid place-items-center flex-shrink-0"><CheckCircle2 size={20} /></div>
          <div><div className="text-xs text-muted">Registered</div><div className="text-xl font-bold">{completedCount}</div></div>
        </Card>
        <Card className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[10px] bg-warning-50 text-warning grid place-items-center flex-shrink-0"><Clock size={20} /></div>
          <div><div className="text-xs text-muted">Pending Completion</div><div className="text-xl font-bold">{pendingCount}</div></div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="p-5 pb-0"><CardHead title="All Students" /></div>
        {loading && <p className="text-sm text-muted text-center py-12">Loading...</p>}
        {!loading && students.length === 0 && (
          <p className="text-sm text-muted text-center py-12">No students uploaded yet — use &quot;Upload Students Data&quot; above.</p>
        )}
        {!loading && students.length > 0 && (
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Roll No.", "College Email", "Phone", "Course / Batch", "Status", "Invite Sent", ""].map((h) => (
                  <th key={h} className="text-left py-3 px-5 text-[10.5px] font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-border-soft last:border-0">
                  <td className="py-3 px-5 font-semibold">{s.full_name}</td>
                  <td className="py-3 px-5">{s.roll_no}</td>
                  <td className="py-3 px-5">{s.college_email}</td>
                  <td className="py-3 px-5">{s.phone || "—"}</td>
                  <td className="py-3 px-5">{s.course ? `${s.course} · ${s.batch}` : "—"}</td>
                  <td className="py-3 px-5">
                    {s.registration_completed ? (
                      <span className="text-[11px] font-semibold text-success bg-success-50 px-2 py-1 rounded-full">Completed</span>
                    ) : (
                      <span className="text-[11px] font-semibold text-warning bg-warning-50 px-2 py-1 rounded-full">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-muted">
                    {s.invite_sent_at ? new Date(s.invite_sent_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "Not sent"}
                  </td>
                  <td className="py-3 px-5">
                    <button
                      onClick={() => handleDelete(s)}
                      disabled={deletingId === s.id}
                      title="Delete this student permanently"
                      className="text-muted hover:text-danger disabled:opacity-50"
                    >
                      {deletingId === s.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}