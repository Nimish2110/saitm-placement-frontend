import { api } from "./api";

export interface ResumeContact {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface ResumeExperience {
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  current: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  school: string;
  degree: string;
  location: string;
  start_date: string;
  end_date: string;
  percentage_gpa: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  link: string;
}

export interface ResumeData {
  contact: ResumeContact;
  target_title: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  certifications: string[];
}

export interface ResumeDraft {
  id: string;
  title: string;
  template: string;
  data: ResumeData;
  created_at: string;
  updated_at: string;
}

export interface ResumeDraftSummary {
  id: string;
  title: string;
  template: string;
  updated_at: string;
}

export interface ResumeFormat {
  id: string;
  name: string;
  description: string;
  style_tag: string;
  file: string;
  original_filename: string;
  uploaded_by_name: string;
  created_at: string;
}

export function fetchPrefillData(): Promise<ResumeData> {
  return api<ResumeData>("/api/students/resumes/prefill/");
}

export function fetchResumeDrafts(): Promise<ResumeDraftSummary[]> {
  return api<ResumeDraftSummary[]>("/api/students/resumes/");
}

export function fetchResumeDraft(id: string): Promise<ResumeDraft> {
  return api<ResumeDraft>(`/api/students/resumes/${id}/`);
}

export function createResumeDraft(title: string, template: string, data: ResumeData): Promise<ResumeDraft> {
  return api<ResumeDraft>("/api/students/resumes/", {
    method: "POST",
    body: JSON.stringify({ title, template, data }),
  });
}

export function updateResumeDraft(id: string, patch: Partial<Pick<ResumeDraft, "title" | "template" | "data">>): Promise<ResumeDraft> {
  return api<ResumeDraft>(`/api/students/resumes/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deleteResumeDraft(id: string): Promise<void> {
  return api(`/api/students/resumes/${id}/`, { method: "DELETE" }) as Promise<void>;
}

// PDF/DOCX exports return raw files, not JSON — fetched with the auth header
// attached manually and streamed to the browser as a download.
async function downloadResumeFile(url: string, filename: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${url}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export function fetchResumeFormats(): Promise<ResumeFormat[]> {
  return api<ResumeFormat[]>("/api/resume-formats/");
}

export function downloadResumePDF(id: string, name: string) {
  return downloadResumeFile(`/api/students/resumes/${id}/export/pdf/`, `${name || "resume"}.pdf`);
}

export function downloadResumeDOCX(id: string, name: string) {
  return downloadResumeFile(`/api/students/resumes/${id}/export/docx/`, `${name || "resume"}.docx`);
}