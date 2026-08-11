"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fetchAssessmentDetail, startAssessment, Assessment } from "@/lib/assessments";
import { ArrowLeft, Clock, Target, Award, PlayCircle } from "lucide-react";

const DIFFICULTY_TEXT: Record<string, string> = {
  Easy: "text-success",
  Medium: "text-warning",
  Hard: "text-danger",
};

export default function AssessmentOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssessmentDetail(id)
      .then(setAssessment)
      .catch(() => setError("Could not load this assessment."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStart() {
    setStarting(true);
    setError("");
    try {
      const attempt = await startAssessment(id);
      router.push(`/assessments/${id}/attempt/${attempt.attempt_id}`);
    } catch {
      setError("Could not start this assessment. Please try again.");
      setStarting(false);
    }
  }

  if (loading) return <Card className="text-center py-16 text-sm text-muted">Loading...</Card>;
  if (error && !assessment) return <Card className="text-center py-16 text-sm text-danger">{error}</Card>;
  if (!assessment) return null;

  return (
    <div>
      <button onClick={() => router.push("/assessments")} className="flex items-center gap-1.5 text-[13px] text-muted hover:text-ink font-medium mb-5">
        <ArrowLeft size={15} /> Back to Assessments
      </button>

      <h1 className="text-2xl font-bold tracking-tight mb-1.5">{assessment.title}</h1>
      <p className="text-[13.5px] text-muted mb-6">{assessment.description}</p>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-bold mb-4">Assessment Overview</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-surface-2 rounded-[10px]">
              <Clock size={20} className="mx-auto text-primary mb-1.5" />
              <div className="text-xl font-bold">{assessment.duration_minutes}</div>
              <div className="text-[11px] text-muted">Minutes</div>
            </div>
            <div className="p-3 bg-surface-2 rounded-[10px]">
              <Target size={20} className="mx-auto text-primary mb-1.5" />
              <div className="text-xl font-bold">{assessment.question_count}</div>
              <div className="text-[11px] text-muted">Questions</div>
            </div>
            <div className="p-3 bg-surface-2 rounded-[10px]">
              <Award size={20} className="mx-auto text-primary mb-1.5" />
              <div className="text-xl font-bold">{assessment.pass_percentage}%</div>
              <div className="text-[11px] text-muted">To Pass</div>
            </div>
          </div>

          <h4 className="text-[11px] font-bold text-muted uppercase tracking-wide mt-5 mb-2">Categories Covered</h4>
          <div className="flex flex-wrap gap-1.5">
            {assessment.tags.map((t) => (
              <span key={t} className="text-[11.5px] font-medium bg-surface-2 px-2.5 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </Card>

        <Card className="bg-primary-50 border-primary/20 flex flex-col items-center justify-center text-center py-8">
          <h3 className="text-base font-bold mb-1">Ready to Start?</h3>
          <p className="text-[12.5px] text-muted mb-1">Test your skills now</p>
          <p className={`text-[11.5px] font-semibold mb-5 ${DIFFICULTY_TEXT[assessment.difficulty]}`}>{assessment.difficulty} difficulty</p>
          {error && <p className="text-xs text-danger mb-3">{error}</p>}
          <Button onClick={handleStart} disabled={starting} className="px-6">
            <PlayCircle size={16} /> {starting ? "Starting..." : "Start Assessment"}
          </Button>
        </Card>
      </div>
    </div>
  );
}