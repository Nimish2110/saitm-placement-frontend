"use client";

import { useEffect, useState } from "react";
import { Card, CardHead } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { NotificationToast } from "@/components/student/NotificationToast";
import { useDriveStore } from "@/lib/notifications";
import { api } from "@/lib/api";
import { fetchLeaderboard, LeaderboardEntry } from "@/lib/assessments";
import Link from "next/link";
import { Briefcase, Bell, UserCircle, Trophy, Medal } from "lucide-react";

// Every field on the Profile page counts toward completeness — mandatory
// AND optional. backlogs is excluded since 0 is a genuinely complete answer,
// not a sign of a missing field.
const ESSENTIAL_FIELDS = [
  "full_name", "phone", "college_email", "personal_email",
  "home_address", "current_residence", "course", "batch", "roll_no", "cgpa",
  "tenth_percentage", "twelfth_percentage", "achievements", "certifications",
  "linkedin", "github", "profile_photo",
] as const;

interface ProfileForCompleteness {
  [key: string]: unknown;
}

export default function DashboardPage() {
  const { drives, appliedDriveIds, loading, fetchDrives, fetchMyApplications } = useDriveStore();
  const [completeness, setCompleteness] = useState<{ percent: number; filled: number; total: number; missing: string[] } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    fetchDrives();
    fetchMyApplications();
    api<ProfileForCompleteness>("/api/students/me/").then((profile) => {
      const missing = ESSENTIAL_FIELDS.filter((f) => {
        const v = profile[f];
        return v === null || v === undefined || v === "";
      });
      const filled = ESSENTIAL_FIELDS.length - missing.length;
      setCompleteness({
        percent: Math.round((filled / ESSENTIAL_FIELDS.length) * 100),
        filled,
        total: ESSENTIAL_FIELDS.length,
        missing: missing.map(fieldLabel),
      });
    });
    fetchLeaderboard(5)
      .then((r) => {
        setLeaderboard(r.leaderboard);
        setMyRank(r.me);
      })
      .finally(() => setLeaderboardLoading(false));
  }, [fetchDrives, fetchMyApplications]);

  return (
    <div>
      <NotificationToast />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[13px] text-muted mt-1">Here&apos;s what&apos;s new on the SAITM Placement Portal.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-[18px]">
          <div className="text-xs text-muted mb-1">Active drives</div>
          <div className="text-[28px] font-bold">{loading ? "…" : drives.length}</div>
        </Card>
        <Card className="p-[18px]">
          <div className="text-xs text-muted mb-1">Applications sent</div>
          <div className="text-[28px] font-bold text-primary">{appliedDriveIds.size}</div>
        </Card>
        <Card className="p-[18px]">
          <div className="text-xs text-muted mb-1">Profile completeness</div>
          {completeness ? (
            <>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-[28px] font-bold">{completeness.percent}%</span>
                <span className="text-[11px] text-muted">{completeness.filled}/{completeness.total} fields</span>
              </div>
              <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${completeness.percent === 100 ? "bg-success" : "bg-warning"}`}
                  style={{ width: `${completeness.percent}%` }}
                />
              </div>
              {completeness.missing.length > 0 && (
                <p className="text-[10.5px] text-muted mt-2">Missing: {completeness.missing.join(", ")}</p>
              )}
            </>
          ) : (
            <div className="text-[28px] font-bold text-muted">…</div>
          )}
        </Card>
      </div>

      <Card className="mb-6">
        <CardHead title="Latest placement drives" action={<Link href="/jobs-placements" className="text-xs text-primary font-semibold">View all →</Link>} />
        <div className="space-y-2.5">
          {drives.slice(0, 3).map((d) => (
            <div key={d.id} className="flex items-center gap-3.5 p-3.5 rounded-[10px] bg-surface-2">
              <div className="w-9 h-9 rounded-[10px] bg-primary-50 text-primary grid place-items-center flex-shrink-0">
                <Briefcase size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-semibold">{d.company_name} — {d.profiles_offered.join(", ")}</h4>
                <p className="text-[11px] text-muted">{d.job_location} · {d.ctc}</p>
              </div>
              <Pill color="info">{d.drive_type}</Pill>
            </div>
          ))}
          {!loading && drives.length === 0 && (
            <p className="text-sm text-muted text-center py-6">No live drives right now.</p>
          )}
        </div>
      </Card>

      <Card className="mb-6">
        <CardHead title="Assessment Leaderboard" action={<Link href="/assessments" className="text-xs text-primary font-semibold">Take an assessment →</Link>} />
        {leaderboardLoading && <p className="text-sm text-muted text-center py-6">Loading...</p>}
        {!leaderboardLoading && leaderboard.length === 0 && (
          <p className="text-sm text-muted text-center py-6">No assessment scores yet — be the first on the leaderboard.</p>
        )}
        {!leaderboardLoading && leaderboard.length > 0 && (
          <div className="space-y-1.5">
            {leaderboard.map((entry) => (
              <div key={entry.roll_no} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] ${entry.rank <= 3 ? "bg-warning-50" : "bg-surface-2"}`}>
                <div className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold flex-shrink-0 ${entry.rank === 1 ? "bg-warning text-white" : entry.rank <= 3 ? "bg-white text-warning border border-warning" : "bg-white text-muted border border-border"}`}>
                  {entry.rank === 1 ? <Trophy size={13} /> : entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{entry.student_name}</p>
                  <p className="text-[11px] text-muted">{entry.roll_no} · {entry.assessments_taken} assessment{entry.assessments_taken === 1 ? "" : "s"}</p>
                </div>
                <span className="text-sm font-bold text-primary flex-shrink-0">{entry.total_score} pts</span>
              </div>
            ))}
            {myRank && myRank.rank > leaderboard.length && (
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] bg-primary-50 mt-2">
                <div className="w-7 h-7 rounded-full bg-white text-primary border border-primary grid place-items-center text-xs font-bold flex-shrink-0">
                  <Medal size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold">You — Rank #{myRank.rank}</p>
                </div>
                <span className="text-sm font-bold text-primary flex-shrink-0">{myRank.total_score} pts</span>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/notifications" className="p-5 rounded-[14px] bg-white border border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[10px] bg-warning-50 text-warning grid place-items-center flex-shrink-0"><Bell size={18} /></div>
          <div>
            <h4 className="text-sm font-semibold">Notifications</h4>
            <p className="text-[11px] text-muted">Drive updates & remarks from the T&P Cell</p>
          </div>
        </Link>
        <Link href="/profile" className="p-5 rounded-[14px] bg-white border border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[10px] bg-primary-50 text-primary grid place-items-center flex-shrink-0"><UserCircle size={18} /></div>
          <div>
            <h4 className="text-sm font-semibold">My Profile</h4>
            <p className="text-[11px] text-muted">Personal & academic details</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function fieldLabel(field: string): string {
  const labels: Record<string, string> = {
    full_name: "Full name", phone: "Phone", college_email: "Official email",
    personal_email: "Personal email", home_address: "Home address",
    current_residence: "Current residence", course: "Course", batch: "Batch",
    roll_no: "Roll number", cgpa: "CGPA",
    tenth_percentage: "10th %", twelfth_percentage: "12th %",
    achievements: "Achievements", certifications: "Certifications",
    linkedin: "LinkedIn", github: "GitHub", profile_photo: "Profile photo",
  };
  return labels[field] || field;
}