"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { uploadDriveJDFiles, DriveJDFile } from "@/lib/driveJDFiles";
import { Upload, FileText, X, Loader2 } from "lucide-react";

export interface JDFileUploadHandle {
  /** Call this once the drive has a real id (after creation succeeds). Returns the uploaded files, or [] if nothing was selected. */
  uploadNow: (driveId: string) => Promise<DriveJDFile[]>;
}

/**
 * Multi-file JD upload — used on the Drive Creation page (PM only).
 * Lets the PM pick several PDF/Word files before the drive even exists yet.
 * The parent form calls ref.current.uploadNow(driveId) right after the
 * drive itself is successfully created, to actually send the files up.
 */
export const JDFileUpload = forwardRef<JDFileUploadHandle>(function JDFileUpload(_props, ref) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    async uploadNow(driveId: string) {
      if (pendingFiles.length === 0) return [];
      setUploading(true);
      setError("");
      try {
        const result = await uploadDriveJDFiles(driveId, pendingFiles);
        if (result.errors.length > 0) {
          setError(result.errors.map((e) => `${e.filename}: rejected`).join(", "));
        }
        setPendingFiles([]);
        return result.created;
      } catch {
        setError("Could not upload JD files.");
        return [];
      } finally {
        setUploading(false);
      }
    },
  }));

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? []);
    e.target.value = "";
    setPendingFiles((prev) => [...prev, ...chosen]);
  }

  function removePending(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5">JD Files (PDF or Word, multiple allowed)</label>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" multiple className="hidden" onChange={handlePick} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 text-[13px] font-semibold text-primary border border-dashed border-primary/40 rounded-[10px] px-4 py-2.5 hover:bg-primary-50 transition-colors"
      >
        <Upload size={15} /> Upload JD files
      </button>

      {pendingFiles.length > 0 && (
        <div className="space-y-1.5 mt-2.5">
          {pendingFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2 text-[12.5px]">
              <FileText size={14} className="text-muted flex-shrink-0" />
              <span className="flex-1 truncate">{f.name}</span>
              <button type="button" onClick={() => removePending(i)} className="text-muted hover:text-danger flex-shrink-0">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && <p className="text-[11.5px] text-muted mt-2 flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Uploading...</p>}
      {error && <p className="text-[11.5px] text-danger mt-2">{error}</p>}
    </div>
  );
});