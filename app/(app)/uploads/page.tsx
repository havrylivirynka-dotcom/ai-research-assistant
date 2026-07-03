import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listUploads } from "@/features/uploads/queries";
import { UploadStatusBadge } from "@/features/uploads/components/upload-status-badge";

export const metadata: Metadata = { title: "Uploads" };

export default async function UploadsPage() {
  const supabase = await createClient();
  const { data: uploads } = await listUploads(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Uploads</h1>
        <p className="text-muted-foreground">
          Every PDF you&apos;ve uploaded for AI analysis, across all projects.
        </p>
      </div>

      {uploads && uploads.length > 0 ? (
        <div className="divide-y divide-border rounded-xl border border-border/60">
          {uploads.map((upload) => (
            <Link
              key={upload.id}
              href={`/projects/${upload.project_id}/uploads/${upload.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-accent"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {upload.file_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {upload.projects?.title ?? "Unknown project"} ·{" "}
                  {new Date(upload.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <UploadStatusBadge status={upload.status} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">No uploads yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Open a project and upload a PDF to get an AI-generated summary,
            strengths, weaknesses and suggested citations.
          </p>
          <Link
            href="/projects"
            className="mt-6 text-sm font-medium text-primary hover:underline"
          >
            Go to projects
          </Link>
        </div>
      )}
    </div>
  );
}
