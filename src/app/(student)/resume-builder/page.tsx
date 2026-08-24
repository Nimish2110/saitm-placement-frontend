"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { fetchResumeDrafts, fetchPrefillData, createResumeDraft, deleteResumeDraft, fetchResumeFormats, ResumeDraftSummary, ResumeFormat } from "@/lib/resumes";
import { UserCircle2, FolderOpen, FileText, Trash2, Sparkles, ExternalLink, Download, Files } from "lucide-react";

export default function ResumeBuilderEntryPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<ResumeDraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [formats, setFormats] = useState<ResumeFormat[]>([]);
  const [formatsLoading, setFormatsLoading] = useState(true);

  useEffect(() => {
    fetchResumeDrafts()
      .then(setDrafts)
      .catch(() => setError("Could not load your saved resumes."))
      .finally(() => setLoading(false));

    fetchResumeFormats()
      .then(setFormats)
      .catch(() => {})
      .finally(() => setFormatsLoading(false));
  }, []);

  async function handleBuildFromProfile() {
    setCreating(true);
    setError("");
    try {
      const prefill = await fetchPrefillData();
      const draft = await createResumeDraft(`${prefill.contact.full_name || "My"} Resume`, "classic", prefill);
      router.push(`/resume-builder/${draft.id}`);
    } catch {
      setError("Could not start a new resume. Please try again.");
      setCreating(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this resume draft? This can't be undone.")) return;
    try {
      await deleteResumeDraft(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("Could not delete that resume.");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Resume Builder</h1>
        <p className="text-[13px] text-muted mt-1">Build a resume from your profile, download it as PDF or DOCX</p>
      </div>

      {error && <p className="text-xs text-danger mb-4">{error}</p>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={handleBuildFromProfile} disabled={creating} className="text-left disabled:opacity-60">
          <Card className="h-full hover:border-primary hover:shadow-md transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-[10px] bg-primary-50 text-primary grid place-items-center mb-3">
              <UserCircle2 size={22} />
            </div>
            <h3 className="text-sm font-bold mb-1">{creating ? "Starting..." : "Build from Profile"}</h3>
            <p className="text-[12.5px] text-muted">Auto-fill from your name, education, and certifications instantly</p>
          </Card>
        </button>

        <Card className="h-full">
          <div className="w-12 h-12 rounded-[10px] bg-surface-3 text-muted grid place-items-center mb-3">
            <FolderOpen size={22} />
          </div>
          <h3 className="text-sm font-bold mb-1">Open Saved</h3>
          <p className="text-[12.5px] text-muted">
            {loading ? "Loading..." : drafts.length === 0 ? "Your saved resumes will appear below once you create one." : `${drafts.length} saved resume${drafts.length === 1 ? "" : "s"}`}
          </p>
        </Card>
      </div>

      {!loading && drafts.length > 0 && (
        <div className="space-y-2.5 mb-6">
          {drafts.map((d) => (
            <Card
              key={d.id}
              onClick={() => router.push(`/resume-builder/${d.id}`)}
              className="flex items-center gap-3.5 cursor-pointer hover:border-primary hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-[10px] bg-primary-50 text-primary grid place-items-center flex-shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-semibold truncate">{d.title}</h4>
                <p className="text-[11px] text-muted">
                  Updated {new Date(d.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <button onClick={(e) => handleDelete(d.id, e)} className="text-muted hover:text-danger flex-shrink-0 p-2">
                <Trash2 size={15} />
              </button>
            </Card>
          ))}
        </div>
      )}

      {!formatsLoading && formats.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Files size={16} className="text-primary" />
            <h3 className="text-sm font-bold">Sample Formats from the T&P Cell</h3>
          </div>
          <p className="text-[12px] text-muted mb-4">
            Real examples uploaded by your Placement Manager — open one for reference while filling in the builder above.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {formats.map((f) => (
              <a
                key={f.id}
                href={f.file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-border rounded-[10px] p-3 hover:border-primary hover:bg-primary-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-2 text-muted grid place-items-center flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[12.5px] font-semibold truncate">{f.name}</h4>
                    {f.style_tag && <span className="text-[10px] bg-primary-50 text-primary px-1.5 py-0.5 rounded-full flex-shrink-0">{f.style_tag}</span>}
                  </div>
                  {f.description && <p className="text-[11px] text-muted truncate">{f.description}</p>}
                </div>
                <Download size={14} className="text-muted flex-shrink-0" />
              </a>
            ))}
          </div>
        </Card>
      )}
      <Card className="flex items-center gap-4 border-amber-200 bg-warning-50">
        <div className="w-11 h-11 rounded-[10px] bg-white text-warning grid place-items-center flex-shrink-0">
          <Sparkles size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-[#92400E]">Want more templates or AI suggestions?</h4>
          <p className="text-[12.5px] text-[#92400E]/80">Try Rezi — a free AI resume builder with ATS scoring. Opens in a new tab.</p>
        </div>
        <a
          href="https://www.rezi.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 bg-white border border-amber-300 text-[#92400E] text-[12.5px] font-semibold px-3.5 py-2 rounded-[10px] hover:bg-amber-100 transition-colors"
        >
          Open Rezi <ExternalLink size={13} />
        </a>
      </Card>
    </div>
  );
}