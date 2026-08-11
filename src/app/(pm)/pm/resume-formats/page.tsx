"use client";

import { useEffect, useState } from "react";
import { Card, CardHead } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fetchResumeFormats, uploadResumeFormat, deleteResumeFormat, ResumeFormat } from "@/lib/resumeFormats";
import { FileText, Upload, Trash2, ExternalLink } from "lucide-react";

export default function PMResumeFormatsPage() {
  const [formats, setFormats] = useState<ResumeFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [styleTag, setStyleTag] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetchResumeFormats()
      .then(setFormats)
      .catch(() => setError("Could not load resume formats."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !file) { setError("Name and a file are required."); return; }
    setUploading(true);
    setError("");
    try {
      await uploadResumeFormat({ name, description, style_tag: styleTag, file });
      setName(""); setDescription(""); setStyleTag(""); setFile(null);
      load();
    } catch {
      setError("Could not upload — make sure it's a PDF or Word file under 10 MB.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this resume format? Students will no longer see it.")) return;
    setDeletingId(id);
    try {
      await deleteResumeFormat(id);
      setFormats((prev) => prev.filter((f) => f.id !== id));
    } catch {
      setError("Could not delete — you can only remove formats you uploaded.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Resume Formats</h1>
        <p className="text-[13px] text-muted mt-1">Upload sample resumes students can browse and download in Resume Builder</p>
      </div>

      <Card className="mb-6">
        <CardHead title="Upload a new format" />
        <form onSubmit={handleUpload}>
          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Modern Tech Resume" className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">Style tag</label>
              <input value={styleTag} onChange={(e) => setStyleTag(e.target.value)} placeholder="e.g. Modern, Classic, Technical" className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Who is this format best for?" className="w-full h-10 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">File (PDF or Word, max 10 MB)</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
          </div>
          {error && <p className="text-xs text-danger mb-3">{error}</p>}
          <Button type="submit" disabled={uploading}>
            <Upload size={14} /> {uploading ? "Uploading..." : "Upload Format"}
          </Button>
        </form>
      </Card>

      {loading && <Card className="text-center py-16 text-sm text-muted">Loading...</Card>}
      {!loading && formats.length === 0 && (
        <Card className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-primary-50 text-primary grid place-items-center mx-auto mb-4">
            <FileText size={24} />
          </div>
          <h3 className="text-base font-bold mb-1">No formats uploaded yet</h3>
          <p className="text-sm text-muted">Upload one above — it&apos;ll show up for students right away.</p>
        </Card>
      )}
      {!loading && formats.length > 0 && (
        <div className="space-y-2.5">
          {formats.map((f) => (
            <Card key={f.id} className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[10px] bg-primary-50 text-primary grid place-items-center flex-shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-semibold">{f.name}</h4>
                  {f.style_tag && <span className="text-[10.5px] font-medium text-primary bg-primary-50 px-2 py-0.5 rounded-full">{f.style_tag}</span>}
                </div>
                <p className="text-[11.5px] text-muted">{f.description || "No description"} · by {f.uploaded_by_name}</p>
              </div>
              <a href={f.file} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary flex-shrink-0">
                <ExternalLink size={15} />
              </a>
              <button onClick={() => handleDelete(f.id)} disabled={deletingId === f.id} className="text-muted hover:text-danger flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}