"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { courseOptions, batchOptions, RegisteredStudent } from "@/lib/students";
import { StudentProfileViewModal } from "@/components/pm/StudentProfileViewModal";
import { Search } from "lucide-react";

export default function StudentDatabasePage() {
  const [students, setStudents] = useState<RegisteredStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState("All courses");
  const [batch, setBatch] = useState("All batches");
  const [rollNo, setRollNo] = useState("");
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (course !== "All courses") params.set("course", course);
      if (batch !== "All batches") params.set("batch", batch);
      if (rollNo.trim()) params.set("roll_no", rollNo.trim());

      api<RegisteredStudent[]>(`/api/students/?${params.toString()}`)
        .then(setStudents)
        .catch(() => setError("Could not load students."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [course, batch, rollNo]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Student Database</h1>
        <p className="text-[13px] text-muted mt-1">{students.length} registered students</p>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
          <input
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            placeholder="Search roll no..."
            className="h-10 pl-9 pr-3 rounded-[10px] border border-border text-sm w-48 focus:outline-none focus:border-primary"
          />
        </div>
        <select value={course} onChange={(e) => setCourse(e.target.value)} className="h-10 px-3.5 rounded-[10px] border border-border text-sm">
          <option>All courses</option>
          {courseOptions.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={batch} onChange={(e) => setBatch(e.target.value)} className="h-10 px-3.5 rounded-[10px] border border-border text-sm">
          <option>All batches</option>
          {batchOptions.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>

      {loading && <Card className="text-center py-16 text-sm text-muted">Loading...</Card>}
      {error && <Card className="text-center py-16 text-sm text-danger">{error}</Card>}

      {!loading && !error && (
        <Card className="p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border">
                {["Student", "Roll No.", "College Email", "Phone", "Course", "Batch", "CGPA"].map((h) => (
                  <th key={h} className="text-left py-3 px-3.5 text-[10.5px] font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setViewingStudentId(s.id)}
                  className="border-b border-border-soft last:border-0 hover:bg-surface-2 cursor-pointer"
                >
                  <td className="py-3 px-3.5 font-semibold">{s.full_name}</td>
                  <td className="py-3 px-3.5">{s.roll_no}</td>
                  <td className="py-3 px-3.5">{s.college_email}</td>
                  <td className="py-3 px-3.5">{s.phone}</td>
                  <td className="py-3 px-3.5">{s.course}</td>
                  <td className="py-3 px-3.5">{s.batch}</td>
                  <td className="py-3 px-3.5">{s.cgpa}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-muted">No students match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      <StudentProfileViewModal
        studentProfileId={viewingStudentId}
        open={!!viewingStudentId}
        onClose={() => setViewingStudentId(null)}
      />
    </div>
  );
}