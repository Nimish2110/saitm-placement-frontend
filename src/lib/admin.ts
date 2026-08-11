import { api } from "./api";

export interface PendingPM {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  employee_id: string;
  created_at: string;
}

export function fetchPMCount(): Promise<{ count: number }> {
  return api<{ count: number }>("/api/auth/admin/pm-count/");
}

export function fetchPendingPMs(): Promise<PendingPM[]> {
  return api<PendingPM[]>("/api/auth/admin/pm-pending/");
}

export function fetchActivePMs(): Promise<PendingPM[]> {
  return api<PendingPM[]>("/api/auth/admin/pm-active/");
}

export function approvePM(id: string): Promise<{ detail: string }> {
  return api<{ detail: string }>(`/api/auth/admin/pm-pending/${id}/accept/`, { method: "POST" });
}

export function rejectPM(id: string): Promise<void> {
  return api(`/api/auth/admin/pm-pending/${id}/reject/`, { method: "POST" }) as Promise<void>;
}

export function deletePM(id: string): Promise<{ detail: string }> {
  return api<{ detail: string }>(`/api/students/admin/pm/${id}/delete/`, { method: "DELETE" });
}