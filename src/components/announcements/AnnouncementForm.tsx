"use client";

import { useState } from "react";
import { Card, CardHead } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { courseOptions, batchOptions } from "@/lib/students";
import { createAnnouncement, TargetType, Announcement } from "@/lib/announcements";
import { Megaphone } from "lucide-react";

export function AnnouncementForm({ onCreated }: { onCreated: (a: Announcement) => void }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [courses, setCourses] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  function toggleCourse(c: string) {
    setCourses((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }
  function toggleBatch(b: string) {
    setBatches((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { setError("Title and message are required."); return; }
    if (targetType === "filtered" && (courses.length === 0 || batches.length === 0)) {
      setError("Select at least one course and one batch, or switch to \"All Students\".");
      return;
    }
    setPosting(true);
    setError("");
    try {
      const announcement = await createAnnouncement({
        title, message, target_type: targetType,
        eligible_courses: targetType === "filtered" ? courses : [],
        eligible_batches: targetType === "filtered" ? batches : [],
      });
      onCreated(announcement);
      setTitle(""); setMessage(""); setTargetType("all"); setCourses([]); setBatches([]);
    } catch {
      setError("Could not post the announcement. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHead title="Post an Announcement" />
      <form onSubmit={handleSubmit}>
        <div className="mb-3.5">
          <label className="block text-xs font-semibold text-ink-2 mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Placement Drive Registration Open"
            className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-ink-2 mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write the announcement details..."
            className="w-full h-24 px-3.5 py-2.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <label className="block text-xs font-semibold text-ink-2 mb-2">Who should see this?</label>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTargetType("all")}
            className={`px-4 py-2 rounded-[10px] text-[13px] font-medium border ${targetType === "all" ? "bg-primary text-white border-primary" : "border-border text-muted"}`}
          >
            All Students
          </button>
          <button
            type="button"
            onClick={() => setTargetType("filtered")}
            className={`px-4 py-2 rounded-[10px] text-[13px] font-medium border ${targetType === "filtered" ? "bg-primary text-white border-primary" : "border-border text-muted"}`}
          >
            Specific Courses / Batches
          </button>
        </div>

        {targetType === "filtered" && (
          <>
            <label className="block text-xs font-semibold text-ink-2 mb-2">Courses</label>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {courseOptions.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => toggleCourse(c)}
                  className={`text-[11.5px] font-medium px-2.5 py-1.5 rounded-full border ${courses.includes(c) ? "bg-primary-50 border-primary text-primary" : "border-border text-muted"}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold text-ink-2 mb-2">Batches</label>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {batchOptions.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => toggleBatch(b)}
                  className={`text-[11.5px] font-medium px-2.5 py-1.5 rounded-full border ${batches.includes(b) ? "bg-primary-50 border-primary text-primary" : "border-border text-muted"}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </>
        )}

        {error && <p className="text-xs text-danger mb-3">{error}</p>}
        <Button type="submit" disabled={posting}>
          <Megaphone size={14} /> {posting ? "Posting..." : "Post Announcement"}
        </Button>
      </form>
    </Card>
  );
}