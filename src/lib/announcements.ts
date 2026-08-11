import { api } from "./api";

export type TargetType = "all" | "filtered";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  target_type: TargetType;
  eligible_courses: string[];
  eligible_batches: string[];
  created_by_name: string;
  created_by_role: "placement_manager" | "admin";
  created_at: string;
}

export interface NewAnnouncement {
  title: string;
  message: string;
  target_type: TargetType;
  eligible_courses?: string[];
  eligible_batches?: string[];
}

export function fetchAnnouncements(): Promise<Announcement[]> {
  return api<Announcement[]>("/api/announcements/");
}

export function createAnnouncement(data: NewAnnouncement): Promise<Announcement> {
  return api<Announcement>("/api/announcements/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteAnnouncement(id: string): Promise<void> {
  return api(`/api/announcements/${id}/`, { method: "DELETE" }) as Promise<void>;
}

export function fetchAnnouncementsUnreadCount(): Promise<{ count: number }> {
  return api<{ count: number }>("/api/announcements/unread-count/");
}

export function markAnnouncementsSeen(): Promise<void> {
  return api("/api/announcements/mark-seen/", { method: "POST" }) as Promise<void>;
}