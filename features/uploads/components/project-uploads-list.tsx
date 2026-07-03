import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDropzone } from "./upload-dropzone";
import { UploadStatusBadge } from "./upload-status-badge";
import type { Database } from "@/types/database";

type Upload = Database["public"]["Tables"]["uploads"]["Row"];

export function ProjectUploadsList({
  projectId,
  uploads,
}: {
  projectId: string;
  uploads: Upload[];
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Uploads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UploadDropzone projectId={projectId} />

        {uploads.length > 0 && (
          <ul className="space-y-3">
            {uploads.map((upload) => (
              <li key={upload.id}>
                <Link
                  href={`/projects/${projectId}/uploads/${upload.id}`}
                  className="flex items-center justify-between gap-3 rounded-md p-2 -mx-2 hover:bg-accent"
                >
                  <span className="truncate text-sm font-medium">
                    {upload.file_name}
                  </span>
                  <UploadStatusBadge status={upload.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
