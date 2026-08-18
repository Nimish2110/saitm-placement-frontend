import { api } from "./api";

export interface AdminDrive {
  id: string;
  drive_type: string;
  company_name: string;
  company_website: string;
  jd_text: string;
  profiles_offered: string[];
  job_location: string;
  eligible_courses: string[];
  eligible_batches: string[];
  ctc: string;
  process_details: string;
  last_date_of_application: string;
  company_link: string;
  pm_note: string;
  posted_by_name: string;
  posted_on: string;
  status: string;
  approval_status: "pending" | "approved" | "rejected";
  approved_on: string | null;
}

export function fetchPendingDrives(): Promise<AdminDrive[]> {
  return api<AdminDrive[]>("/api/drives/admin/pending/");
}

export function fetchPublishedDrives(): Promise<AdminDrive[]> {
  return api<AdminDrive[]>("/api/drives/admin/published/");
}

export function updateDrive(id: string, data: Partial<AdminDrive>): Promise<AdminDrive> {
  return api<AdminDrive>(`/api/drives/admin/${id}/`, { method: "PATCH", body: JSON.stringify(data) });
}

export function approveDrive(id: string): Promise<AdminDrive> {
  return api<AdminDrive>(`/api/drives/admin/${id}/approve/`, { method: "POST" });
}

export function rejectDrive(id: string): Promise<AdminDrive> {
  return api<AdminDrive>(`/api/drives/admin/${id}/reject/`, { method: "POST" });
}

export function deleteDrive(id: string): Promise<void> {
  return api(`/api/drives/admin/${id}/`, { method: "DELETE" }) as Promise<void>;
}