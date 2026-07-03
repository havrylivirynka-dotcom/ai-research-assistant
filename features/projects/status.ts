import type { PROJECT_STATUSES } from "@/schemas/project";

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_progress: "In progress",
  review: "In review",
  completed: "Completed",
  archived: "Archived",
};

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  review: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
  archived: "bg-muted text-muted-foreground",
};
