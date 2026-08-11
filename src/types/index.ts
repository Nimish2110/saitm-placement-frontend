export type ConsentStatus = "required" | "accepted" | "declined" | "not-eligible";

export interface Job {
  id: string;
  role: string;
  company: string;
  companyLogoColor: string;
  companyInitial: string;
  description: string;
  skills: string[];
  location: string;
  mode: "Onsite" | "Hybrid" | "Remote" | "WFH";
  createdOn: string;
  deadline: string;
  package: string;
  driveType: "Campus Placement" | "Off-Campus";
  consent: ConsentStatus;
  status?: "Applied" | "Under Review" | "Interview Scheduled" | "Selected" | "Rejected" | "Closed";
}

export interface NotificationItem {
  id: string;
  type: "consent" | "status" | "announcement";
  title: string;
  body: string;
  time: string;
  jobId?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  branch: string;
  section: string;
  cgpa: number;
  backlogs: number;
  status: "Placed" | "Not Placed" | "In Process" | "Non-placeable";
  blockState: "Active" | "Auto-blocked" | "Manually blocked";
  blockUntil?: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  location: string;
  branches: string[];
  pocName: string;
  pocDesignation: string;
  notes?: string;
  nextFollowUp?: string;
}

export interface BranchCount {
  branch: string;
  count: number;
  color: string;
}

export interface DepartmentRow {
  department: string;
  total: number;
  placeable: number;
  nonPlaceable: number;
  placed: number;
  placedPct: number;
  color: string;
}
