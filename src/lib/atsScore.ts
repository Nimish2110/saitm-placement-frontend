import { ResumeData } from "./resumes";

export interface ATSCheck {
  label: string;
  passed: boolean;
  weight: number;
}

export interface ATSResult {
  score: number;
  checks: ATSCheck[];
  fixes: string[];
  strengths: string[];
}

// Transparent, rule-based scoring — not a black box. Every point is explained
// by a specific, visible check below.
export function computeATSScore(data: ResumeData): ATSResult {
  const checks: ATSCheck[] = [
    {
      label: "Contact info complete (name, email, phone)",
      passed: !!(data.contact.full_name && data.contact.email && data.contact.phone),
      weight: 15,
    },
    {
      label: "Has a professional summary",
      passed: (data.summary || "").trim().length >= 40,
      weight: 15,
    },
    {
      label: "Has at least one work experience or project",
      passed: data.experience.length > 0 || data.projects.length > 0,
      weight: 20,
    },
    {
      label: "Work experience has detailed bullet points",
      passed: data.experience.some((e) => e.bullets.some((b) => b.trim().length > 20)),
      weight: 15,
    },
    {
      label: "Has education listed",
      passed: data.education.length > 0,
      weight: 10,
    },
    {
      label: "Has at least 3 skills listed",
      passed: data.skills.length >= 3,
      weight: 15,
    },
    {
      label: "LinkedIn or portfolio link included",
      passed: !!(data.contact.linkedin || data.contact.github || data.contact.portfolio),
      weight: 10,
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
  const fixes = checks.filter((c) => !c.passed).map((c) => c.label);
  const strengths = checks.filter((c) => c.passed).map((c) => c.label);

  return { score, checks, fixes, strengths };
}