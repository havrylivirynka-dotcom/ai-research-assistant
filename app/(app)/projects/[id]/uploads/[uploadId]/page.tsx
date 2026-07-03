import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUpload } from "@/features/uploads/queries";
import { UploadStatusBadge } from "@/features/uploads/components/upload-status-badge";
import { UploadDetail } from "@/features/uploads/components/upload-detail";

type PageProps = { params: Promise<{ id: string; uploadId: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { uploadId } = await params;
  const supabase = await createClient();
  const { data: upload } = await getUpload(supabase, uploadId);
  return { title: upload?.file_name ?? "Upload" };
}

export default async function UploadDetailPage({ params }: PageProps) {
  const { id, uploadId } = await params;
  const supabase = await createClient();
  const { data: upload, error } = await getUpload(supabase, uploadId);

  if (error || !upload) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {upload.projects?.title ?? "Project"}
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {upload.file_name}
        </h1>
        <UploadStatusBadge status={upload.status} />
      </div>

      <UploadDetail initialUpload={upload} />
    </div>
  );
}
