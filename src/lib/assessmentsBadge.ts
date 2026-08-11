"use client";

import { create } from "zustand";
import { fetchUnattemptedCount } from "./assessments";

interface AssessmentsBadgeStore {
  unattemptedCount: number;
  refreshUnattemptedCount: () => Promise<void>;
}

// Shared across the whole app — the sidebar badge reads this, and the
// assessment attempt page calls refreshUnattemptedCount() right after a
// successful submit, so the badge drops instantly without a page reload.
export const useAssessmentsBadgeStore = create<AssessmentsBadgeStore>((set) => ({
  unattemptedCount: 0,

  refreshUnattemptedCount: async () => {
    try {
      const r = await fetchUnattemptedCount();
      set({ unattemptedCount: r.count });
    } catch {
      // leave whatever count we already had
    }
  },
}));