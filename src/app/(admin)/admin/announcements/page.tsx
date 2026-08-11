"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { fetchAnnouncements, Announcement } from "@/lib/announcements";
import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnnouncements()
      .then(setAnnouncements)
      .catch(() => setError("Could not load announcements."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <p className="text-[13px] text-muted mt-1">Post updates for all students, or target specific courses/batches — as Admin you can remove any announcement</p>
      </div>

      <AnnouncementForm onCreated={(a) => setAnnouncements((prev) => [a, ...prev])} />

      {loading && <Card className="text-center py-16 text-sm text-muted">Loading...</Card>}
      {error && <Card className="text-center py-16 text-sm text-danger">{error}</Card>}
      {!loading && !error && (
        <AnnouncementList
          announcements={announcements}
          onDeleted={(id) => setAnnouncements((prev) => prev.filter((a) => a.id !== id))}
        />
      )}
    </div>
  );
}