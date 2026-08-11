"use client";

import { create } from "zustand";
import { api } from "./api";

export interface Remark {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  placement_manager_name: string;
}

interface RemarksStore {
  remarks: Remark[];
  loading: boolean;
  fetchRemarks: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useRemarksStore = create<RemarksStore>((set, get) => ({
  remarks: [],
  loading: false,

  fetchRemarks: async () => {
    set({ loading: true });
    try {
      const remarks = await api<Remark[]>("/api/students/me/remarks/");
      set({ remarks, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api(`/api/students/me/remarks/${id}/read/`, { method: "PATCH" });
      set({ remarks: get().remarks.filter((r) => r.id !== id) });
    } catch {
      // leave it in the list — student can try again
    }
  },
}));