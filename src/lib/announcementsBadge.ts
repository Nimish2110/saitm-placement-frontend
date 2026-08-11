"use client";

import { create } from "zustand";
import { fetchAnnouncementsUnreadCount, markAnnouncementsSeen as apiMarkSeen } from "./announcements";

interface AnnouncementsBadgeStore {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  markSeen: () => void;
}

// Shared across the whole app — the sidebar badge and the Announcements page
// both read/write this same store, so marking something seen updates the
// badge everywhere instantly, with no page reload needed.
export const useAnnouncementsBadgeStore = create<AnnouncementsBadgeStore>((set) => ({
  unreadCount: 0,

  fetchUnreadCount: async () => {
    try {
      const r = await fetchAnnouncementsUnreadCount();
      set({ unreadCount: r.count });
    } catch {
      // leave whatever count we already had
    }
  },

  markSeen: () => {
    set({ unreadCount: 0 }); // instant feedback — don't wait on the network
    apiMarkSeen().catch(() => {
      // if this silently fails, the next fetchUnreadCount() call will self-correct
    });
  },
}));