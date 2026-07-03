import { cn } from "@/lib/utils";

export const UPLOAD_STATUS_CLASSES: Record<string, string> = {
  processing: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
};

export function UploadStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
        UPLOAD_STATUS_CLASSES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}
