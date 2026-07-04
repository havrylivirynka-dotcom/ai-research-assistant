import type { PROJECT_STATUSES } from "@/schemas/project";

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/**
 * Maps a project status to its translation key in the shared "common"
 * namespace (see messages/uk/core.json and messages/en/core.json). Labels
 * are user-facing and must be translated at the call site via
 * `useTranslations("common")`, e.g. `t(STATUS_LABEL_KEYS[status])`.
 */
export const STATUS_LABEL_KEYS: Record<string, string> = {
  draft: "draft",
  in_progress: "inProgress",
  review: "review",
  completed: "completed",
  archived: "archived",
};

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  review: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
  archived: "bg-muted text-muted-foreground",
};
