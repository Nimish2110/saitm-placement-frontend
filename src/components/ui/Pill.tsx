import { cn } from "@/lib/utils";
import { ConsentStatus } from "@/types";

type PillColor = "primary" | "success" | "warning" | "danger" | "info" | "accent" | "neutral";

const pillClasses: Record<PillColor, string> = {
  primary: "bg-primary-50 text-primary",
  success: "bg-success-50 text-[#065F46]",
  warning: "bg-warning-50 text-[#92400E]",
  danger: "bg-danger-50 text-[#991B1B]",
  info: "bg-info-50 text-[#1E40AF]",
  accent: "bg-accent-50 text-accent",
  neutral: "bg-surface-3 text-muted",
};

export function Pill({
  color = "neutral",
  children,
  className,
}: {
  color?: PillColor;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold",
        pillClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}

const consentClasses: Record<ConsentStatus, { color: string; label: string }> = {
  required: { color: "bg-warning-50 text-[#92400E]", label: "Consent Required" },
  accepted: { color: "bg-success-50 text-[#065F46]", label: "Consent: Yes" },
  declined: { color: "bg-danger-50 text-[#991B1B]", label: "Consent: No" },
  "not-eligible": { color: "bg-surface-3 text-muted", label: "Not eligible" },
};

export function ConsentTag({ status, label }: { status: ConsentStatus; label?: string }) {
  const c = consentClasses[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold", c.color)}>
      {label ?? c.label}
    </span>
  );
}
