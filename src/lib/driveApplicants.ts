import { api } from "./api";

export interface DriveApplicant {
  id: string;
  student_name: string;
  roll_no: string;
  course: string;
  batch: string;
  status: string;
  applied_on: string;
}

export function fetchDriveApplicants(driveId: string, filters?: { course?: string; batch?: string }): Promise<DriveApplicant[]> {
  const params = new URLSearchParams({ drive: driveId });
  if (filters?.course) params.append("course", filters.course);
  if (filters?.batch) params.append("batch", filters.batch);
  return api<DriveApplicant[]>(`/api/applications/?${params.toString()}`);
}