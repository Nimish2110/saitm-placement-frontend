import { api, setTokens, clearTokens, setRole, getRole } from "./api";

interface TokenResponse {
  access: string;
  refresh: string;
  role?: string;
}

export const studentAuth = {
  register: (data: { full_name: string; email: string; password: string }) =>
    api("/api/auth/register/", { method: "POST", body: JSON.stringify(data), auth: false }),

  verifyOtp: async (email: string, otp: string) => {
    const res = await api<TokenResponse>("/api/auth/verify-otp/", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
      auth: false,
    });
    setTokens(res.access, res.refresh);
    setRole("student");
    return res;
  },

  login: async (email: string, password: string) => {
    const res = await api<TokenResponse>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
    setTokens(res.access, res.refresh);
    setRole("student");
    return res;
  },

  logout: () => clearTokens(),
  isAuthed: () => typeof window !== "undefined" && !!localStorage.getItem("access_token") && getRole() === "student",
};

export const pmAuth = {
  register: (data: { full_name: string; email: string; password: string; phone: string; employee_id?: string }) =>
    api<{ detail: string }>("/api/auth/pm-register/", { method: "POST", body: JSON.stringify(data), auth: false }),

  login: async (email: string, password: string) => {
    const res = await api<TokenResponse>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
    setTokens(res.access, res.refresh);
    setRole("placement_manager");
    return res;
  },

  logout: () => clearTokens(),
  isAuthed: () => typeof window !== "undefined" && !!localStorage.getItem("access_token") && getRole() === "placement_manager",
};

export const adminAuth = {
  login: async (email: string, password: string) => {
    const res = await api<TokenResponse>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
    setTokens(res.access, res.refresh);
    setRole("admin");
    return res;
  },

  logout: () => clearTokens(),
  isAuthed: () => typeof window !== "undefined" && !!localStorage.getItem("access_token") && getRole() === "admin",
};