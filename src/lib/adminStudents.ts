import { api } from "./api";

export interface AdminStudentRow {
  id: string;
  full_name: string;
  roll_no: string;
  college_email: string;
  phone: string;
  course: string;
  batch: string;
  registration_completed: boolean;
  invite_sent_at: string | null;
  created_at: string;
}

export interface BulkImportResult {
  created: number;
  skipped: number;
  errors: string[];
  detail: string;
}

export interface SendInvitesResult {
  sent: number;
  detail: string;
}

export function fetchAdminStudents(): Promise<AdminStudentRow[]> {
  return api<AdminStudentRow[]>("/api/students/admin/list/");
}

export function bulkImportStudents(file: File): Promise<BulkImportResult> {
  const fd = new FormData();
  fd.append("file", file);
  return api<BulkImportResult>("/api/students/admin/bulk-import/", { method: "POST", body: fd });
}

export function sendInvites(): Promise<SendInvitesResult> {
  return api<SendInvitesResult>("/api/students/admin/send-invites/", { method: "POST" });
}

export function deleteStudent(id: string): Promise<{ detail: string }> {
  return api<{ detail: string }>(`/api/students/admin/${id}/delete/`, { method: "DELETE" });
}