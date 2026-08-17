"use client";

import { DriveJDFile } from "@/lib/driveJDFiles";
import { FileText, Download } from "lucide-react";

/**
 * Read-only list of a drive's uploaded JD files — used on the student-facing
 * Jobs & Placements page. Pass in the jd_files array that already comes
 * back nested inside each drive from GET /api/drives/.
 */
export function JDFileList({ files }: { files: DriveJDFile[] }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="text-[10.5px] font-semibold text-muted uppercase tracking-wide mb-1.5">Job Description Files</p>
      <div className="flex flex-wrap gap-2">
        {files.map((f) => (
          <a
            key={f.id}
            href={f.file}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-surface-2 hover:bg-primary-50 hover:text-primary text-ink text-[11.5px] font-medium px-2.5 py-1.5 rounded-full transition-colors"
          >
            <FileText size={12} />
            <span className="max-w-[140px] truncate">{f.original_filename}</span>
            <Download size={11} />
          </a>
        ))}
      </div>
    </div>
  );
}