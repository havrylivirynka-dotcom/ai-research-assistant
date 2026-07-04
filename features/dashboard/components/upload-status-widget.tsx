import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { WidgetCard, WidgetEmptyState } from "./widget-card";
import { UploadStatusBadge } from "@/features/uploads/components/upload-status-badge";

type UploadRow = {
  id: string;
  file_name: string;
  status: string;
  projects: { id: string; title: string } | null;
};

export async function UploadStatusWidget({ uploads }: { uploads: UploadRow[] }) {
  const t = await getTranslations("uploadStatusWidget");

  return (
    <WidgetCard title={t("title")} viewAllHref="/uploads">
      {uploads.length === 0 ? (
        <WidgetEmptyState message={t("emptyState")} />
      ) : (
        <ul className="space-y-3">
          {uploads.map((upload) => (
            <li key={upload.id} className="flex items-center justify-between gap-3">
              <Link
                href={
                  upload.projects
                    ? `/projects/${upload.projects.id}`
                    : "/uploads"
                }
                className="truncate text-sm font-medium"
              >
                {upload.file_name}
              </Link>
              <UploadStatusBadge status={upload.status} />
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
