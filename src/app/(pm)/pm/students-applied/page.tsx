"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { courseOptions, batchOptions } from "@/lib/students";
import { api, downloadFile, ApiRequestError } from "@/lib/api";
import { Application } from "@/lib/notifications";
import { StudentProfileViewModal } from "@/components/pm/StudentProfileViewModal";
import { Filter, X, Download, Search } from "lucide-react";

export default function StudentsAppliedPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [course, setCourse] = useState("All courses");
  const [batch, setBatch] = useState("All batches");
  const [company, setCompany] = useState("All companies");
  const [rollNo, setRollNo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  function buildParams() {
    const params = new URLSearchParams();
    if (course !== "All courses") params.set("course", course);
    if (batch !== "All batches") params.set("batch", batch);
    if (company !== "All companies") params.set("company", company);
    if (rollNo.trim()) params.set("roll_no", rollNo.trim());
    return params;
  }

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      api<Application[]>(`/api/applications/?${buildParams().toString()}`)
        .then(setApplications)
        .catch(() => setError("Could not load applications."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, batch, company, rollNo]);

  async function handleExport() {
    setExporting(true);
    setExportError("");
    try {
      await downloadFile(`/api/applications/export/?${buildParams().toString()}`, "applications_export.xlsx");
    } catch (err) {
      setExportError(err instanceof ApiRequestError ? err.body.detail || "Export failed" : "Could not reach the server");
    } finally {
      setExporting(false);
    }
  }

  const companyOptions = Array.from(new Set(applications.map((a) => a.company_name)));
  const activeFilterCount = [course !== "All courses", batch !== "All batches", company !== "All companies"].filter(Boolean).length;

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students Applied</h1>
          <p className="text-[13px] text-muted mt-1">{applications.length} applications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
            <input
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="Search roll no..."
              className="h-10 pl-9 pr-3 rounded-[10px] border border-border text-sm w-44 focus:outline-none focus:border-primary"
            />
          </div>
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            <Download size={14} /> {exporting ? "Exporting..." : "Export"}
          </Button>
          <div className="relative">
            <Button variant="outline" onClick={() => setPanelOpen(!panelOpen)}>
              <Filter size={14} /> Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            {panelOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-border rounded-[14px] shadow-xl z-20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold">Filter applications</h4>
                  <button onClick={() => setPanelOpen(false)}><X size={16} className="text-muted" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-2 mb-1.5">Branch / Course</label>
                    <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm">
                      <option>All courses</option>
                      {courseOptions.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-2 mb-1.5">Batch</label>
                    <select value={batch} onChange={(e) => setBatch(e.target.value)} className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm">
                      <option>All batches</option>
                      {batchOptions.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-2 mb-1.5">Choose Company</label>
                    <select value={company} onChange={(e) => setCompany(e.target.value)} className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm">
                      <option>All companies</option>
                      {companyOptions.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1 justify-center" onClick={() => { setCourse("All courses"); setBatch("All batches"); setCompany("All companies"); }}>Clear</Button>
                  <Button className="flex-1 justify-center" onClick={() => setPanelOpen(false)}>Apply</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {exportError && <p className="text-xs text-danger mb-4">{exportError}</p>}

      {loading && <Card className="text-center py-16 text-sm text-muted">Loading...</Card>}
      {error && <Card className="text-center py-16 text-sm text-danger">{error}</Card>}

      {!loading && !error && (
        <Card className="p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border">
                {["Student", "Roll No.", "Course", "Batch", "Company", "Status", "Applied on"].map((h) => (
                  <th key={h} className="text-left py-3 px-3.5 text-[10.5px] font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setViewingStudentId(a.student_profile_id)}
                  className="border-b border-border-soft last:border-0 hover:bg-surface-2 cursor-pointer"
                >
                  <td className="py-3 px-3.5 font-semibold">{a.student_name}</td>
                  <td className="py-3 px-3.5">{a.roll_no}</td>
                  <td className="py-3 px-3.5">{a.course}</td>
                  <td className="py-3 px-3.5">{a.batch}</td>
                  <td className="py-3 px-3.5">{a.company_name}</td>
                  <td className="py-3 px-3.5">{a.status}</td>
                  <td className="py-3 px-3.5">{new Date(a.applied_on).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-muted">No applications match.</td></tr>
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