"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  fetchResumeDraft, updateResumeDraft, downloadResumePDF, downloadResumeDOCX,
  ResumeData, ResumeExperience, ResumeEducation, ResumeProject,
} from "@/lib/resumes";
import { computeATSScore } from "@/lib/atsScore";
import { ArrowLeft, Plus, Trash2, Download, FileDown, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type TemplateId = "classic" | "professional" | "modern";

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "classic", label: "ATS Optimized" },
  { id: "professional", label: "Professional" },
  { id: "modern", label: "Modern" },
];

export default function ResumeEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  useEffect(() => {
    fetchResumeDraft(id)
      .then((draft) => {
        setTitle(draft.title);
        setData(draft.data);
        if (draft.template === "classic" || draft.template === "professional" || draft.template === "modern") {
          setTemplate(draft.template);
        }
      })
      .catch(() => setError("Could not load this resume."))
      .finally(() => setLoading(false));
  }, [id]);

  const update = useCallback((patch: Partial<ResumeData>) => {
    setData((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      await updateResumeDraft(id, { title, template, data });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadPDF() {
    if (!data) return;
    setDownloadingPdf(true);
    try {
      await handleSave();
      await downloadResumePDF(id, data.contact.full_name);
    } catch {
      setError("PDF download failed.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleDownloadDOCX() {
    if (!data) return;
    setDownloadingDocx(true);
    try {
      await handleSave();
      await downloadResumeDOCX(id, data.contact.full_name);
    } catch {
      setError("DOCX download failed.");
    } finally {
      setDownloadingDocx(false);
    }
  }

  if (loading) return <Card className="text-center py-16 text-sm text-muted">Loading...</Card>;
  if (error && !data) return <Card className="text-center py-16 text-sm text-danger">{error}</Card>;
  if (!data) return null;

  const ats = computeATSScore(data);

  return (
    <div>
      {/* Template switcher — right below the global header */}
      <div className="flex gap-1 bg-white border border-border rounded-[10px] p-1 mb-5 w-fit overflow-x-auto">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
              template === t.id ? "bg-primary text-white font-semibold" : "text-muted hover:bg-surface-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <button onClick={() => router.push("/resume-builder")} className="flex items-center gap-1.5 text-[13px] text-muted hover:text-ink font-medium">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-success font-semibold flex items-center gap-1"><CheckCircle2 size={13} /> Saved</span>}
          <Button variant="outline" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          <Button variant="outline" onClick={handleDownloadDOCX} disabled={downloadingDocx}>
            {downloadingDocx ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} DOCX
          </Button>
          <Button onClick={handleDownloadPDF} disabled={downloadingPdf}>
            {downloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} PDF
          </Button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-xl font-bold mb-5 bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-0.5"
      />

      {error && <p className="text-xs text-danger mb-4">{error}</p>}

      {/* ATS score panel */}
      <Card className="mb-5">
        <div className="flex items-center gap-5 mb-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#F1F5F9" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="16" fill="none"
                stroke={ats.score >= 70 ? "#10B981" : ats.score >= 40 ? "#F59E0B" : "#EF4444"}
                strokeWidth="3" strokeDasharray={`${ats.score} 100`} strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-sm font-bold">{ats.score}</div>
          </div>
          <div>
            <h3 className="text-sm font-bold">ATS Score — {ats.score >= 70 ? "Strong" : ats.score >= 40 ? "Needs work" : "Weak"}</h3>
            <p className="text-[11.5px] text-muted">Based on {ats.checks.length} checks — updates live as you edit</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ats.fixes.map((f) => (
            <span key={f} className="flex items-center gap-1.5 bg-danger-50 text-[#991B1B] text-[11px] font-medium px-2.5 py-1.5 rounded-full">
              <AlertCircle size={11} /> {f}
            </span>
          ))}
          {ats.strengths.map((s) => (
            <span key={s} className="flex items-center gap-1.5 bg-success-50 text-[#065F46] text-[11px] font-medium px-2.5 py-1.5 rounded-full">
              <CheckCircle2 size={11} /> {s}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-5 items-start">
        {/* Form */}
        <div className="space-y-4">
          <Section title="Contact Information">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" value={data.contact.full_name} onChange={(v) => update({ contact: { ...data.contact, full_name: v } })} />
              <Field label="Email" value={data.contact.email} onChange={(v) => update({ contact: { ...data.contact, email: v } })} />
              <Field label="Phone" value={data.contact.phone} onChange={(v) => update({ contact: { ...data.contact, phone: v } })} />
              <Field label="Location" value={data.contact.location} onChange={(v) => update({ contact: { ...data.contact, location: v } })} />
              <Field label="LinkedIn URL" value={data.contact.linkedin} onChange={(v) => update({ contact: { ...data.contact, linkedin: v } })} />
              <Field label="GitHub URL" value={data.contact.github} onChange={(v) => update({ contact: { ...data.contact, github: v } })} />
              <Field label="Portfolio URL" value={data.contact.portfolio} onChange={(v) => update({ contact: { ...data.contact, portfolio: v } })} />
              <Field label="Target Title" value={data.target_title} onChange={(v) => update({ target_title: v })} placeholder="e.g. Software Engineer" />
            </div>
          </Section>

          <Section title="Professional Summary">
            <textarea
              value={data.summary}
              onChange={(e) => update({ summary: e.target.value })}
              placeholder="2-3 sentences summarizing your background and what you're looking for..."
              className="w-full h-24 px-3.5 py-2.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
            />
          </Section>

          <Section title="Work Experience">
            {data.experience.map((exp, i) => (
              <ExperienceEntry
                key={i}
                exp={exp}
                onChange={(patch) => {
                  const next = [...data.experience];
                  next[i] = { ...next[i], ...patch };
                  update({ experience: next });
                }}
                onRemove={() => update({ experience: data.experience.filter((_, j) => j !== i) })}
              />
            ))}
            <AddButton
              label="Add work experience"
              onClick={() =>
                update({
                  experience: [
                    ...data.experience,
                    { company: "", role: "", location: "", start_date: "", end_date: "", current: false, bullets: [""] } as ResumeExperience,
                  ],
                })
              }
            />
          </Section>

          <Section title="Education">
            {data.education.map((edu, i) => (
              <EducationEntry
                key={i}
                edu={edu}
                onChange={(patch) => {
                  const next = [...data.education];
                  next[i] = { ...next[i], ...patch };
                  update({ education: next });
                }}
                onRemove={() => update({ education: data.education.filter((_, j) => j !== i) })}
              />
            ))}
            <AddButton
              label="Add education"
              onClick={() =>
                update({
                  education: [...data.education, { school: "", degree: "", location: "", start_date: "", end_date: "", percentage_gpa: "" } as ResumeEducation],
                })
              }
            />
          </Section>

          <Section title="Projects">
            {data.projects.map((proj, i) => (
              <ProjectEntry
                key={i}
                proj={proj}
                onChange={(patch) => {
                  const next = [...data.projects];
                  next[i] = { ...next[i], ...patch };
                  update({ projects: next });
                }}
                onRemove={() => update({ projects: data.projects.filter((_, j) => j !== i) })}
              />
            ))}
            <AddButton label="Add project" onClick={() => update({ projects: [...data.projects, { name: "", description: "", link: "" } as ResumeProject] })} />
          </Section>

          <Section title="Skills">
            <TagInput values={data.skills} onChange={(skills) => update({ skills })} placeholder="Type a skill and press Enter" />
          </Section>

          <Section title="Certifications">
            <TagInput values={data.certifications} onChange={(certifications) => update({ certifications })} placeholder="Type a certification and press Enter" />
          </Section>
        </div>

        {/* Live preview */}
        <div className="sticky top-24">
          <Card className="p-0 overflow-hidden bg-white">
            <ResumePreview data={data} template={template} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <h3 className="text-[11px] font-bold text-muted uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </Card>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[10.5px] font-semibold text-muted mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 rounded-[8px] border border-border text-[13px] focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-primary mt-2">
      <Plus size={14} /> {label}
    </button>
  );
}

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  function addTag() {
    if (input.trim()) {
      onChange([...values, input.trim()]);
      setInput("");
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v, i) => (
          <span key={i} className="flex items-center gap-1 bg-primary-50 text-primary text-[11.5px] font-medium px-2.5 py-1 rounded-full">
            {v}
            <button onClick={() => onChange(values.filter((_, j) => j !== i))}><Trash2 size={10} /></button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
        onBlur={addTag}
        placeholder={placeholder}
        className="w-full h-9 px-3 rounded-[8px] border border-border text-[13px] focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function ExperienceEntry({ exp, onChange, onRemove }: { exp: ResumeExperience; onChange: (p: Partial<ResumeExperience>) => void; onRemove: () => void }) {
  return (
    <div className="border border-border-soft rounded-[10px] p-3 mb-3">
      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        <Field label="Role" value={exp.role} onChange={(v) => onChange({ role: v })} />
        <Field label="Company" value={exp.company} onChange={(v) => onChange({ company: v })} />
        <Field label="Location" value={exp.location} onChange={(v) => onChange({ location: v })} />
        <Field label="Start — End" value={`${exp.start_date}${exp.end_date ? " - " + exp.end_date : ""}`} onChange={() => {}} placeholder="Jun 2025 - Aug 2025" />
      </div>
      <label className="block text-[10.5px] font-semibold text-muted mb-1">Bullet points (one per line)</label>
      <textarea
        value={exp.bullets.join("\n")}
        onChange={(e) => onChange({ bullets: e.target.value.split("\n") })}
        className="w-full h-20 px-3 py-2 rounded-[8px] border border-border text-[13px] focus:outline-none focus:border-primary"
      />
      <button onClick={onRemove} className="text-[11.5px] text-danger font-semibold mt-2 flex items-center gap-1"><Trash2 size={11} /> Remove</button>
    </div>
  );
}

function EducationEntry({ edu, onChange, onRemove }: { edu: ResumeEducation; onChange: (p: Partial<ResumeEducation>) => void; onRemove: () => void }) {
  return (
    <div className="border border-border-soft rounded-[10px] p-3 mb-3">
      <div className="grid grid-cols-2 gap-2.5 mb-2">
        <Field label="Degree / Course" value={edu.degree} onChange={(v) => onChange({ degree: v })} />
        <Field label="School" value={edu.school} onChange={(v) => onChange({ school: v })} />
        <Field label="Year" value={edu.end_date} onChange={(v) => onChange({ end_date: v })} />
        <Field label="Score / CGPA" value={edu.percentage_gpa} onChange={(v) => onChange({ percentage_gpa: v })} />
      </div>
      <button onClick={onRemove} className="text-[11.5px] text-danger font-semibold flex items-center gap-1"><Trash2 size={11} /> Remove</button>
    </div>
  );
}

function ProjectEntry({ proj, onChange, onRemove }: { proj: ResumeProject; onChange: (p: Partial<ResumeProject>) => void; onRemove: () => void }) {
  return (
    <div className="border border-border-soft rounded-[10px] p-3 mb-3">
      <div className="grid grid-cols-2 gap-2.5 mb-2">
        <Field label="Project Name" value={proj.name} onChange={(v) => onChange({ name: v })} />
        <Field label="Link" value={proj.link} onChange={(v) => onChange({ link: v })} />
      </div>
      <label className="block text-[10.5px] font-semibold text-muted mb-1">Description</label>
      <textarea
        value={proj.description}
        onChange={(e) => onChange({ description: e.target.value })}
        className="w-full h-16 px-3 py-2 rounded-[8px] border border-border text-[13px] focus:outline-none focus:border-primary mb-2"
      />
      <button onClick={onRemove} className="text-[11.5px] text-danger font-semibold flex items-center gap-1"><Trash2 size={11} /> Remove</button>
    </div>
  );
}

// ---------------- Preview renderers — 3 genuinely distinct layouts ----------------

function ResumePreview({ data, template }: { data: ResumeData; template: TemplateId }) {
  if (template === "professional") return <ProfessionalPreview data={data} />;
  if (template === "modern") return <ModernPreview data={data} />;
  return <ClassicPreview data={data} />;
}

function contactLineOf(data: ResumeData) {
  return [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin, data.contact.github, data.contact.portfolio]
    .filter(Boolean)
    .join("  |  ");
}

function ClassicPreview({ data }: { data: ResumeData }) {
  return (
    <div className="p-8 text-[12px] leading-relaxed text-ink">
      <h1 className="text-xl font-bold text-center">{data.contact.full_name || "Your Name"}</h1>
      {contactLineOf(data) && <p className="text-center text-[10.5px] text-muted mb-1">{contactLineOf(data)}</p>}
      {data.target_title && <p className="text-center text-[11px] font-semibold text-primary mb-2">{data.target_title}</p>}
      <hr className="border-primary my-2" />
      <PreviewSections data={data} headingClass="text-[11px] font-bold text-primary uppercase tracking-wide mt-3 mb-1" />
    </div>
  );
}

function ProfessionalPreview({ data }: { data: ResumeData }) {
  return (
    <div className="text-[12px] leading-relaxed text-ink">
      <div className="bg-primary text-white px-8 py-6">
        <h1 className="text-2xl font-bold">{data.contact.full_name || "Your Name"}</h1>
        {data.target_title && <p className="text-[12px] text-white/80 mt-0.5">{data.target_title}</p>}
        {contactLineOf(data) && <p className="text-[10.5px] text-white/70 mt-2">{contactLineOf(data)}</p>}
      </div>
      <div className="p-8">
        <PreviewSections data={data} headingClass="text-[11.5px] font-bold uppercase tracking-wide mt-4 mb-1.5 pb-1 border-b-2 border-primary text-ink" />
      </div>
    </div>
  );
}

function ModernPreview({ data }: { data: ResumeData }) {
  return (
    <div className="flex text-[12px] leading-relaxed text-ink min-h-[500px]">
      <div className="w-[34%] bg-primary-50 p-6">
        <h1 className="text-lg font-bold text-primary mb-0.5">{data.contact.full_name || "Your Name"}</h1>
        {data.target_title && <p className="text-[11px] text-ink-2 mb-3">{data.target_title}</p>}

        <h4 className="text-[10px] font-bold text-primary uppercase tracking-wide mt-4 mb-1.5">Contact</h4>
        <div className="space-y-1 text-[10.5px] text-ink-2">
          {data.contact.email && <p className="break-words">{data.contact.email}</p>}
          {data.contact.phone && <p>{data.contact.phone}</p>}
          {data.contact.location && <p>{data.contact.location}</p>}
          {data.contact.linkedin && <p className="break-words">{data.contact.linkedin}</p>}
          {data.contact.github && <p className="break-words">{data.contact.github}</p>}
        </div>

        {data.skills.length > 0 && (
          <>
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-wide mt-4 mb-1.5">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((s, i) => (
                <span key={i} className="text-[9.5px] bg-white text-primary px-1.5 py-0.5 rounded">{s}</span>
              ))}
            </div>
          </>
        )}

        {data.certifications.length > 0 && (
          <>
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-wide mt-4 mb-1.5">Certifications</h4>
            <ul className="text-[10.5px] text-ink-2 space-y-1">
              {data.certifications.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </>
        )}
      </div>

      <div className="flex-1 p-6">
        {data.summary && (
          <>
            <h4 className="text-[11px] font-bold text-ink uppercase tracking-wide mb-1">Summary</h4>
            <p className="mb-3">{data.summary}</p>
          </>
        )}
        {data.experience.length > 0 && (
          <>
            <h4 className="text-[11px] font-bold text-ink uppercase tracking-wide mb-1">Experience</h4>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-2">
                <p className="font-semibold">{exp.role} — {exp.company}</p>
                <p className="text-[10.5px] text-muted-2">{[exp.location, exp.start_date, exp.current ? "Present" : exp.end_date].filter(Boolean).join(" | ")}</p>
                <ul className="list-disc list-inside">
                  {exp.bullets.filter((b) => b.trim()).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              </div>
            ))}
          </>
        )}
        {data.education.length > 0 && (
          <>
            <h4 className="text-[11px] font-bold text-ink uppercase tracking-wide mb-1 mt-3">Education</h4>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-1.5">
                <p className="font-semibold">{edu.degree} — {edu.school}</p>
                <p className="text-[10.5px] text-muted-2">{[edu.location, edu.end_date, edu.percentage_gpa && `Score: ${edu.percentage_gpa}`].filter(Boolean).join(" | ")}</p>
              </div>
            ))}
          </>
        )}
        {data.projects.length > 0 && (
          <>
            <h4 className="text-[11px] font-bold text-ink uppercase tracking-wide mb-1 mt-3">Projects</h4>
            {data.projects.map((p, i) => (
              <div key={i} className="mb-1.5">
                <p className="font-semibold">{p.name}</p>
                {p.description && <p>{p.description}</p>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// Shared section list used by Classic + Professional (both single-column layouts)
function PreviewSections({ data, headingClass }: { data: ResumeData; headingClass: string }) {
  return (
    <>
      {data.summary && (
        <>
          <h2 className={headingClass}>Professional Summary</h2>
          <p>{data.summary}</p>
        </>
      )}
      {data.experience.length > 0 && (
        <>
          <h2 className={headingClass}>Work Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-2">
              <p className="font-semibold">{exp.role} — {exp.company}</p>
              <p className="text-[10.5px] text-muted-2">{[exp.location, exp.start_date, exp.current ? "Present" : exp.end_date].filter(Boolean).join(" | ")}</p>
              <ul className="list-disc list-inside">
                {exp.bullets.filter((b) => b.trim()).map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}
      {data.education.length > 0 && (
        <>
          <h2 className={headingClass}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-1.5">
              <p className="font-semibold">{edu.degree} — {edu.school}</p>
              <p className="text-[10.5px] text-muted-2">{[edu.location, edu.end_date, edu.percentage_gpa && `Score: ${edu.percentage_gpa}`].filter(Boolean).join(" | ")}</p>
            </div>
          ))}
        </>
      )}
      {data.projects.length > 0 && (
        <>
          <h2 className={headingClass}>Projects</h2>
          {data.projects.map((p, i) => (
            <div key={i} className="mb-1.5">
              <p className="font-semibold">{p.name}</p>
              {p.description && <p>{p.description}</p>}
            </div>
          ))}
        </>
      )}
      {data.skills.length > 0 && (
        <>
          <h2 className={headingClass}>Skills</h2>
          <p>{data.skills.join(", ")}</p>
        </>
      )}
      {data.certifications.length > 0 && (
        <>
          <h2 className={headingClass}>Certifications</h2>
          <ul className="list-disc list-inside">
            {data.certifications.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </>
      )}
    </>
  );
}