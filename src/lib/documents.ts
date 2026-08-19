import { api } from "./api";

export type DocType = "resume" | "aadhar" | "tenth_marksheet" | "twelfth_marksheet" | "certificate";

export interface StudentDocument {
  id: string;
  doc_type: DocType;
  file: string;
  original_filename: string;
  uploaded_at: string;
}

export function fetchDocuments(docType: DocType): Promise<StudentDocument[]> {
  return api<StudentDocument[]>(`/api/students/me/documents/?doc_type=${docType}`);
}

export function uploadDocument(docType: DocType, file: File): Promise<StudentDocument> {
  const fd = new FormData();
  fd.append("doc_type", docType);
  fd.append("file", file);
  return api<StudentDocument>("/api/students/me/documents/", { method: "POST", body: fd });
}

export function deleteDocument(id: string): Promise<void> {
  return api(`/api/students/me/documents/${id}/`, { method: "DELETE" }) as Promise<void>;
}

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  resume: "Resume",
  aadhar: "Aadhar Card",
  tenth_marksheet: "10th Marksheet",
  twelfth_marksheet: "12th Marksheet",
  certificate: "Certificate",
};

export interface MyPhotoResponse {
  profile_photo: string;
}

export function uploadMyPhoto(file: File): Promise<MyPhotoResponse> {
  const fd = new FormData();
  fd.append("photo", file);
  return api<MyPhotoResponse>("/api/auth/me/photo/", { method: "PATCH", body: fd });
}

export function deleteMyPhoto(): Promise<void> {
  return api("/api/auth/me/photo/", { method: "DELETE" }) as Promise<void>;
}

export interface MyRemark {
  id: string;
  message: string;
  created_at: string;
  placement_manager_name: string;
}

export function fetchMyRemarks(): Promise<MyRemark[]> {
  return api<MyRemark[]>("/api/students/me/remarks/");
}