import { api } from "./api";

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

export function fetchResumeFormats(): Promise<ResumeFormat[]> {
  return api<ResumeFormat[]>("/api/resume-formats/");
}

export function uploadResumeFormat(data: { name: string; description: string; style_tag: string; file: File }): Promise<ResumeFormat> {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("description", data.description);
  fd.append("style_tag", data.style_tag);
  fd.append("file", data.file);
  return api<ResumeFormat>("/api/resume-formats/", { method: "POST", body: fd });
}

export function deleteResumeFormat(id: string): Promise<void> {
  return api(`/api/resume-formats/${id}/`, { method: "DELETE" }) as Promise<void>;
}