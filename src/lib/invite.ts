import { api, setTokens, setRole } from "./api";

export interface InviteInfo {
  full_name: string;
  roll_no: string;
  college_email: string;
  phone: string;
}

export interface CompleteRegistrationPayload {
  password: string;
  phone?: string;
  personal_email?: string;
  home_address: string;
  current_residence: string;
  course: string;
  batch: string;
  cgpa?: string;
  backlogs?: number;
  tenth_percentage: string;
  twelfth_percentage: string;
  achievements?: string;
  certifications?: string;
  linkedin?: string;
  github?: string;
}

export function fetchInviteInfo(token: string): Promise<InviteInfo> {
  return api<InviteInfo>(`/api/students/invite/${token}/`, { auth: false });
}

export async function completeRegistration(token: string, payload: CompleteRegistrationPayload) {
  const res = await api<{ access: string; refresh: string; role: string }>(
    `/api/students/invite/${token}/complete/`,
    { method: "POST", body: JSON.stringify(payload), auth: false }
  );
  setTokens(res.access, res.refresh);
  setRole("student");
  return res;
}