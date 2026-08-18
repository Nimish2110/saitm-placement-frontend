import { api } from "./api";

export interface DashboardData {
  kpis: {
    companies_posted: number;
    students_registered: number;
    active_pms: number;
    applications_submitted: number;
  };
  approval_breakdown: { approved: number; pending: number; rejected: number };
  registration_breakdown: { completed: number; pending: number };
  students_by_course: { course: string; count: number }[];
  top_companies: { company_name: string; count: number }[];
  drive_type_breakdown: { type: string; count: number }[];
  drives_trend: { week: string; count: number }[];
  date_range: { from: string; to: string };
}

export interface DashboardFilters {
  from?: string;
  to?: string;
  course?: string;
  batch?: string;
}

export function fetchDashboard(filters: DashboardFilters): Promise<DashboardData> {
  const params = new URLSearchParams();
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.course) params.append("course", filters.course);
  if (filters.batch) params.append("batch", filters.batch);
  return api<DashboardData>(`/api/admin/dashboard/?${params.toString()}`);
}