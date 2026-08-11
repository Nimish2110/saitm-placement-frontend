// Course/batch choices are real dropdown options, not mock data.
// Actual student records come from the backend (/api/students/) — see pm/students/page.tsx
export const courseOptions = [
  "B.Tech - Computer Science Engineering",
  "B.Tech - Computer Science and Technology",
  "B.Tech - Computer Science Engineering (AI-ML)",
  "B.Tech - Mechanical Engineering",
  "B.Tech - Electronics and Telecommunication",
  "B.Tech - Civil Engineering",
  "B.Tech - Data Science",
  "BCA (Bachelor of Computer Application)",
  "BBA (Bachelor of Business Administration)",
  "MBA (Masters of Business Administration) - Human Resource",
  "MBA (Masters of Business Administration) - Finance",
  "MBA (Masters of Business Administration) - Sales & Marketing",
  "MBA (Masters of Business Administration) - Business Analytics",
  "MCA",
  "MTECH",
  "D.Pharma",
];

export const batchOptions = ["2025", "2026", "2027", "2028"];

export interface RegisteredStudent {
  id: string;
  full_name: string;
  roll_no: string;
  college_email: string;
  phone: string;
  course: string;
  batch: string;
  cgpa: string;
}