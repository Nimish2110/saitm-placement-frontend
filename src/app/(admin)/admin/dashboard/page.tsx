"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fetchDashboard, DashboardData } from "@/lib/adminDashboard";
import { courseOptions, batchOptions } from "@/lib/students";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Briefcase, Users, UserCheck, FileCheck2, Filter } from "lucide-react";

const COLORS = ["#1B2A4A", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#3B82F6", "#EC4899", "#14B8A6"];

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminDashboardPage() {
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(today());
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    fetchDashboard({ from, to, course, batch })
      .then(setData)
      .catch(() => setError("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[13px] text-muted mt-1">Everything happening across the placement portal, at a glance</p>
      </div>

      <Card className="mb-6">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 px-3 rounded-[10px] border border-border text-[13px] w-[150px]" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 px-3 rounded-[10px] border border-border text-[13px] w-[150px]" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5">Course</label>
            <select value={course} onChange={(e) => setCourse(e.target.value)} className="h-9 px-3 rounded-[10px] border border-border text-[13px] w-[190px]">
              <option value="">All courses</option>
              {courseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5">Batch</label>
            <select value={batch} onChange={(e) => setBatch(e.target.value)} className="h-9 px-3 rounded-[10px] border border-border text-[13px] w-[130px]">
              <option value="">All batches</option>
              {batchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <Button onClick={load} disabled={loading}>
            <Filter size={14} /> {loading ? "Loading..." : "Apply filters"}
          </Button>
          {data && (
            <span className="text-[11.5px] text-muted ml-auto">
              Showing {new Date(data.date_range.from).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} – {new Date(data.date_range.to).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
      </Card>

      {error && <Card className="text-center py-10 text-sm text-danger mb-6">{error}</Card>}
      {loading && !data && <Card className="text-center py-16 text-sm text-muted">Loading dashboard...</Card>}

      {data && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <KpiCard icon={<Briefcase size={20} />} color="#1B2A4A" bg="#EEF1F6" label="Companies posted" sub="in selected range" value={data.kpis.companies_posted} />
            <KpiCard icon={<Users size={20} />} color="#10B981" bg="#ECFDF5" label="Students registered" sub="matching filters" value={data.kpis.students_registered} />
            <KpiCard icon={<UserCheck size={20} />} color="#3B82F6" bg="#EFF6FF" label="Active placement managers" sub="current total" value={data.kpis.active_pms} />
            <KpiCard icon={<FileCheck2 size={20} />} color="#F59E0B" bg="#FEF3C7" label="Applications submitted" sub="in selected range" value={data.kpis.applications_submitted} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card>
              <h3 className="text-[13px] font-bold mb-3">Drive approval status</h3>
              {(data.approval_breakdown.approved + data.approval_breakdown.pending + data.approval_breakdown.rejected) === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Approved", value: data.approval_breakdown.approved },
                        { name: "Pending", value: data.approval_breakdown.pending },
                        { name: "Rejected", value: data.approval_breakdown.rejected },
                      ]}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                      <Cell fill="#EF4444" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="text-[13px] font-bold mb-3">Student registration status</h3>
              {(data.registration_breakdown.completed + data.registration_breakdown.pending) === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: data.registration_breakdown.completed },
                        { name: "Pending", value: data.registration_breakdown.pending },
                      ]}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card>
              <h3 className="text-[13px] font-bold mb-3">Students by course</h3>
              {data.students_by_course.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.students_by_course} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="course" width={100} tick={{ fontSize: 10.5 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {data.students_by_course.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="text-[13px] font-bold mb-3">Top companies by applications</h3>
              {data.top_companies.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.top_companies} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="company_name" width={100} tick={{ fontSize: 10.5 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {data.top_companies.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="text-[13px] font-bold mb-3">Drives posted over time</h3>
              {data.drives_trend.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.drives_trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 10.5 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#1B2A4A" strokeWidth={2.5} dot={{ fill: "#1B2A4A", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="text-[13px] font-bold mb-3">Drive type breakdown</h3>
              {data.drive_type_breakdown.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={data.drive_type_breakdown} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {data.drive_type_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ icon, color, bg, label, sub, value }: { icon: React.ReactNode; color: string; bg: string; label: string; sub: string; value: number }) {
  return (
    <Card className="flex items-start gap-3.5">
      <div className="w-11 h-11 rounded-[10px] grid place-items-center flex-shrink-0" style={{ background: bg, color }}>
        {icon}
      </div>
      <div>
        <p className="text-[12px] text-muted leading-tight">{label}</p>
        <p className="text-[10.5px] text-muted-2">{sub}</p>
        <p className="text-[26px] font-bold mt-0.5" style={{ color }}>{value}</p>
      </div>
    </Card>
  );
}

function EmptyChart() {
  return <p className="text-sm text-muted text-center py-16">No data in this range yet.</p>;
}