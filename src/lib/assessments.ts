import { api } from "./api";

export interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration_minutes: number;
  pass_percentage: number;
  tags: string[];
  question_count: number;
}

export interface AttemptQuestion {
  id: string;
  order: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  points: number;
}

export interface AttemptStart {
  attempt_id: string;
  assessment_title: string;
  duration_minutes: number;
  questions: AttemptQuestion[];
  answers?: Record<string, string>;
  submitted?: boolean;
}

export interface ResultQuestion extends AttemptQuestion {
  correct_option: "A" | "B" | "C" | "D";
  your_answer: string | null;
  is_correct: boolean;
}

export interface AttemptResult {
  id: string;
  assessment_title: string;
  score: number;
  total_possible: number;
  passed: boolean;
  pass_percentage: number;
  submitted_at: string;
  questions: ResultQuestion[];
}

export interface MyAttempt {
  id: string;
  assessment: string;
  assessment_title: string;
  score: number;
  total_possible: number;
  passed: boolean;
  started_at: string;
  submitted_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  student_name: string;
  roll_no: string;
  course: string;
  total_score: number;
  assessments_taken: number;
}

export function fetchAssessments(): Promise<Assessment[]> {
  return api<Assessment[]>("/api/assessments/");
}

export function fetchAssessmentDetail(id: string): Promise<Assessment> {
  return api<Assessment>(`/api/assessments/${id}/`);
}

export function startAssessment(id: string): Promise<AttemptStart> {
  return api<AttemptStart>(`/api/assessments/${id}/start/`, { method: "POST" });
}

export function fetchAttemptState(attemptId: string): Promise<AttemptStart | AttemptResult> {
  return api(`/api/assessments/attempts/${attemptId}/`);
}

export function saveAnswer(attemptId: string, questionId: string, selectedOption: string): Promise<{ answers: Record<string, string> }> {
  return api(`/api/assessments/attempts/${attemptId}/answer/`, {
    method: "PATCH",
    body: JSON.stringify({ question_id: questionId, selected_option: selectedOption }),
  });
}

export function submitAttempt(attemptId: string): Promise<AttemptResult> {
  return api<AttemptResult>(`/api/assessments/attempts/${attemptId}/submit/`, { method: "POST" });
}

export function fetchMyAttempts(): Promise<MyAttempt[]> {
  return api<MyAttempt[]>("/api/assessments/my-attempts/");
}

export function fetchLeaderboard(limit = 10): Promise<{ leaderboard: LeaderboardEntry[]; me: LeaderboardEntry | null }> {
  return api(`/api/assessments/leaderboard/?limit=${limit}`);
}

export function fetchUnattemptedCount(): Promise<{ count: number }> {
  return api<{ count: number }>("/api/assessments/unattempted-count/");
}