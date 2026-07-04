import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { STATUS_BADGE_CLASSES, STATUS_LABEL_KEYS } from "@/features/projects/status";

export async function ProjectStatusBadge({ status }: { status: string }) {
  const t = await getTranslations("common");
  const labelKey = STATUS_LABEL_KEYS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_BADGE_CLASSES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {labelKey ? t(labelKey as Parameters<typeof t>[0]) : status}
    </span>
  );
}
