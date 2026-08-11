import { api } from "./api";

export interface DocSummaryEntry {
  count: number;
  uploaded: boolean;
}

export interface StudentFullProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  college_email: string;
  personal_email: string;
  linkedin: string;
  github: string;
  home_address: string;
  current_residence: string;
  roll_no: string;
  course: string;
  batch: string;
  cgpa: string | null;
  backlogs: number;
  tenth_percentage: string;
  twelfth_percentage: string;
  achievements: string;
  certifications: string;
  gender: string;
  date_of_birth: string | null;
  current_location: string;
  hometown_location: string;
  profile_photo: string | null;
  documents_summary: {
    resume: DocSummaryEntry;
    aadhar: DocSummaryEntry;
    tenth_marksheet: DocSummaryEntry;
    twelfth_marksheet: DocSummaryEntry;
  };
}

export interface Remark {
  id: string;
  student: string;
  message: string;
  created_at: string;
  placement_manager_name: string;
}

export function fetchStudentFullProfile(studentProfileId: string): Promise<StudentFullProfile> {
  return api<StudentFullProfile>(`/api/students/${studentProfileId}/full/`);
}

export function fetchStudentRemarks(studentProfileId: string): Promise<Remark[]> {
  return api<Remark[]>(`/api/students/${studentProfileId}/remarks/`);
}

export function postStudentRemark(studentProfileId: string, message: string): Promise<Remark> {
  return api<Remark>(`/api/students/${studentProfileId}/remarks/`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}