"use client";

import { create } from "zustand";
import { api, ApiRequestError } from "./api";

export interface DriveJDFile {
  id: string;
  file: string;
  original_filename: string;
  uploaded_at: string;
}

export interface Drive {
  id: string;
  drive_type: string;
  company_name: string;
  company_website: string;
  jd_text: string;
  jd_files: DriveJDFile[];
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
  status: "open" | "closed";
  is_eligible: boolean;
}

export interface Application {
  id: string;
  student: string;
  drive: string;
  status: string;
  applied_on: string;
  student_name: string;
  roll_no: string;
  course: string;
  batch: string;
  company_name: string;
  student_profile_id: string;
}

interface DriveStore {
  drives: Drive[];
  loading: boolean;
  error: string | null;
  appliedDriveIds: Set<string>;
  fetchDrives: () => Promise<void>;
  fetchMyApplications: () => Promise<void>;
  submitApplication: (driveId: string, formData: FormData) => Promise<{ ok: boolean; message: string }>;
}

export const useDriveStore = create<DriveStore>((set) => ({
  drives: [],
  loading: false,
  error: null,
  appliedDriveIds: new Set(),

  fetchDrives: async () => {
    set({ loading: true, error: null });
    try {
      const drives = await api<Drive[]>("/api/drives/");
      set({ drives, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Failed to load drives" });
    }
  },

  fetchMyApplications: async () => {
    try {
      const apps = await api<Application[]>("/api/applications/mine/");
      set({ appliedDriveIds: new Set(apps.map((a) => a.drive)) });
    } catch {
      // non-fatal
    }
  },

  submitApplication: async (driveId, formData) => {
    try {
      await api(`/api/drives/${driveId}/apply/`, { method: "POST", body: formData });
      set((state) => ({ appliedDriveIds: new Set(state.appliedDriveIds).add(driveId) }));
      return { ok: true, message: "Application submitted successfully." };
    } catch (e) {
      if (e instanceof ApiRequestError) {
        const message =
          e.body.detail ||
          Object.entries(e.body)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(" ") : val}`)
            .join(" | ");
        return { ok: false, message: message || "Something went wrong." };
      }
      return { ok: false, message: "Could not reach the server." };
    }
  },
}));