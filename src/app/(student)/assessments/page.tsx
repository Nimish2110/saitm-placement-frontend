"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { fetchAssessments, Assessment } from "@/lib/assessments";
import { ClipboardList, ListTodo, Clock, HelpCircle, Award } from "lucide-react";

const tabs = ["Practice", "Tasks"] as const;

const DIFFICULTY_COLOR: Record<string, "success" | "warning" | "danger"> = {
  Easy: "success",
  Medium: "warning",
  Hard: "danger",
};

export default function AssessmentsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Practice");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (tab !== "Practice") return;
    setLoading(true);
    fetchAssessments()
      .then(setAssessments)
      .catch(() => setError("Could not load assessments."))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Assessments</h1>
        <p className="text-[13px] text-muted mt-1">Practice questions and assigned tasks from the T&P Cell</p>
      </div>

      <div className="flex gap-1 bg-white border border-border rounded-[10px] p-1 mb-5 w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              tab === t ? "bg-primary text-white font-semibold" : "text-muted hover:bg-surface-2"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Practice" && (
        <>
          {loading && <Card className="text-center py-16 text-sm text-muted">Loading...</Card>}
          {error && <Card className="text-center py-16 text-sm text-danger">{error}</Card>}

          {!loading && !error && (
            <div className="grid grid-cols-2 gap-4">
              {assessments.map((a) => (
                <Card
                  key={a.id}
                  onClick={() => router.push(`/assessments/${a.id}`)}
                  className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Pill color="neutral">{a.category}</Pill>
                    <Pill color={DIFFICULTY_COLOR[a.difficulty] || "neutral"}>{a.difficulty}</Pill>
                  </div>
                  <h3 className="text-base font-bold mb-1.5">{a.title}</h3>
                  <p className="text-[12.5px] text-muted mb-3 line-clamp-2">{a.description}</p>
                  <div className="flex items-center gap-4 text-[11.5px] text-muted mb-3">
                    <span className="flex items-center gap-1"><Clock size={12} /> {a.duration_minutes} min</span>
                    <span className="flex items-center gap-1"><HelpCircle size={12} /> {a.question_count} Qs</span>
                    <span className="flex items-center gap-1"><Award size={12} /> Pass: {a.pass_percentage}%</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {a.tags.map((t) => (
                      <span key={t} className="text-[10.5px] font-medium text-muted bg-surface-2 px-2 py-1 rounded-full">#{t}</span>
                    ))}
                  </div>
                </Card>
              ))}

              {assessments.length === 0 && (
                <Card className="col-span-2 text-center py-16">
                  <div className="w-14 h-14 rounded-full bg-primary-50 text-primary grid place-items-center mx-auto mb-4">
                    <ClipboardList size={24} />
                  </div>
                  <h3 className="text-base font-bold mb-1">No practice sets yet</h3>
                  <p className="text-sm text-muted">Practice questions will show up here once they&apos;re added.</p>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {tab === "Tasks" && (
        <Card className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-primary-50 text-primary grid place-items-center mx-auto mb-4">
            <ListTodo size={24} />
          </div>
          <h3 className="text-base font-bold mb-1">No tasks assigned yet</h3>
          <p className="text-sm text-muted">Tasks assigned by the T&P Cell will show up here.</p>
        </Card>
      )}
    </div>
  );
}