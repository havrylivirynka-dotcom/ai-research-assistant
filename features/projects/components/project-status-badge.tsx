import { cn } from "@/lib/utils";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/features/projects/status";

export function ProjectStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_BADGE_CLASSES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
