"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  fetchAttemptState, saveAnswer, submitAttempt,
  AttemptStart, AttemptResult, AttemptQuestion,
} from "@/lib/assessments";
import { useAssessmentsBadgeStore } from "@/lib/assessmentsBadge";
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Trophy, ArrowLeft } from "lucide-react";

function isResult(data: AttemptStart | AttemptResult): data is AttemptResult {
  return "submitted_at" in data && !!(data as AttemptResult).submitted_at;
}

export default function AssessmentAttemptPage() {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>();
  const router = useRouter();

  const [data, setData] = useState<AttemptStart | AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const refreshAssessmentsBadge = useAssessmentsBadgeStore((s) => s.refreshUnattemptedCount);

  const load = useCallback(() => {
    setLoading(true);
    fetchAttemptState(attemptId)
      .then((d) => {
        setData(d);
        if (!isResult(d)) {
          setAnswers(d.answers || {});
          setSecondsLeft(d.duration_minutes * 60);
        }
      })
      .catch(() => setError("Could not load this assessment attempt."))
      .finally(() => setLoading(false));
  }, [attemptId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (secondsLeft === null || (data && isResult(data))) return;
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, data]);

  async function handleSelect(question: AttemptQuestion, option: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
    try {
      await saveAnswer(attemptId, question.id, option);
    } catch {
      setError("Could not save that answer — check your connection.");
    }
  }

  async function handleSubmit() {
    if (!confirm("Submit your assessment? You won't be able to change your answers after this.")) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await submitAttempt(attemptId);
      setData(result);
      refreshAssessmentsBadge(); // sidebar badge drops instantly, no reload needed
    } catch {
      setError("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Card className="text-center py-16 text-sm text-muted">Loading...</Card>;
  if (error && !data) return <Card className="text-center py-16 text-sm text-danger">{error}</Card>;
  if (!data) return null;

  // ---------- RESULTS VIEW ----------
  if (isResult(data)) {
    const percent = data.total_possible > 0 ? Math.round((data.score / data.total_possible) * 100) : 0;
    return (
      <div>
        <button onClick={() => router.push("/assessments")} className="flex items-center gap-1.5 text-[13px] text-muted hover:text-ink font-medium mb-5">
          <ArrowLeft size={15} /> Back to Assessments
        </button>

        <Card className="mb-5 text-center py-8">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#F1F5F9" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="16" fill="none"
                stroke={data.passed ? "#10B981" : "#EF4444"}
                strokeWidth="3" strokeDasharray={`${percent} 100`} strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-2xl font-bold">{percent}%</span>
            </div>
          </div>
          <h2 className="text-lg font-bold mb-1">{data.assessment_title}</h2>
          <p className="text-sm text-muted mb-2">
            You scored {data.score} / {data.total_possible} — needed {data.pass_percentage}% to pass
          </p>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold ${data.passed ? "bg-success-50 text-[#065F46]" : "bg-danger-50 text-[#991B1B]"}`}>
            {data.passed ? <><Trophy size={14} /> Passed</> : <>Not passed — keep practicing</>}
          </span>
        </Card>

        <h3 className="text-sm font-bold mb-3">Review your answers</h3>
        <div className="space-y-3">
          {data.questions.map((q, i) => (
            <Card key={q.id}>
              <p className="text-[13px] font-semibold mb-3">{i + 1}. {q.question_text}</p>
              <div className="space-y-1.5">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const text = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d }[opt];
                  const isCorrectOpt = opt === q.correct_option;
                  const isYourAnswer = opt === q.your_answer;
                  let cls = "border-border-soft";
                  if (isCorrectOpt) cls = "border-success bg-success-50";
                  else if (isYourAnswer && !isCorrectOpt) cls = "border-danger bg-danger-50";
                  return (
                    <div key={opt} className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-[12.5px] ${cls}`}>
                      {isCorrectOpt && <CheckCircle2 size={14} className="text-success flex-shrink-0" />}
                      {isYourAnswer && !isCorrectOpt && <XCircle size={14} className="text-danger flex-shrink-0" />}
                      <span>{text}</span>
                      {isYourAnswer && <span className="ml-auto text-[10.5px] font-semibold text-muted">Your answer</span>}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ---------- IN-PROGRESS VIEW ----------
  const question = data.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const mins = secondsLeft !== null ? Math.floor(secondsLeft / 60) : 0;
  const secs = secondsLeft !== null ? secondsLeft % 60 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold bg-white border border-border rounded-full px-4 py-1.5">
          Question {currentIndex + 1} / {data.questions.length}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <Clock size={15} /> {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>

      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden mb-5">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentIndex + 1) / data.questions.length) * 100}%` }} />
      </div>

      {error && <p className="text-xs text-danger mb-3">{error}</p>}

      <Card className="mb-5">
        <p className="text-[15px] font-semibold mb-1">{question.question_text}</p>
        <p className="text-[11px] text-muted mb-4">{question.points} points</p>

        <div className="space-y-2.5">
          {(["A", "B", "C", "D"] as const).map((opt) => {
            const text = { A: question.option_a, B: question.option_b, C: question.option_c, D: question.option_d }[opt];
            const selected = answers[question.id] === opt;
            return (
              <button
                key={opt}
                onClick={() => handleSelect(question, opt)}
                className={`w-full flex items-center gap-3 text-left border rounded-[10px] px-4 py-3 text-[13.5px] transition-colors ${
                  selected ? "border-primary bg-primary-50 font-semibold" : "border-border hover:border-primary/50"
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? "border-primary bg-primary" : "border-border"}`} />
                {text}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => i - 1)}>
          <ChevronLeft size={15} /> Previous
        </Button>
        <span className="text-[12.5px] text-muted">{answeredCount} / {data.questions.length} answered</span>
        {currentIndex < data.questions.length - 1 ? (
          <Button onClick={() => setCurrentIndex((i) => i + 1)}>
            Next <ChevronRight size={15} />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Assessment"}
          </Button>
        )}
      </div>
    </div>
  );
}