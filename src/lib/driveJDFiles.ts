import { api } from "./api";

export interface DriveJDFile {
  id: string;
  file: string;
  original_filename: string;
  uploaded_at: string;
}

export function fetchDriveJDFiles(driveId: string): Promise<DriveJDFile[]> {
  return api<DriveJDFile[]>(`/api/drives/${driveId}/jd-files/`);
}

export function uploadDriveJDFiles(driveId: string, files: File[]): Promise<{ created: DriveJDFile[]; errors: { filename: string; errors: unknown }[] }> {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  return api(`/api/drives/${driveId}/jd-files/`, { method: "POST", body: fd });
}

export function deleteDriveJDFile(fileId: string): Promise<void> {
  return api(`/api/drives/jd-files/${fileId}/`, { method: "DELETE" }) as Promise<void>;
}