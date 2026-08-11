import { Card } from "./Card";
import { cn } from "@/lib/utils";

export function KPICard({
  label,
  value,
  delta,
  deltaTone = "success",
  icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: "success" | "danger" | "muted";
  icon?: React.ReactNode;
}) {
  const toneClass = {
    success: "text-success",
    danger: "text-danger",
    muted: "text-muted",
  }[deltaTone];

  return (
    <Card className="p-[18px]">
      <div className="flex justify-between items-start mb-3.5">
        <span className="text-xs text-muted font-medium">{label}</span>
        {icon && <div className="w-9 h-9 rounded-[10px] bg-primary-50 text-primary grid place-items-center flex-shrink-0">{icon}</div>}
      </div>
      <div className="text-[28px] font-bold text-ink leading-none tracking-tight">{value}</div>
      {delta && <div className={cn("text-[11px] font-semibold mt-1.5", toneClass)}>{delta}</div>}
    </Card>
  );
}
