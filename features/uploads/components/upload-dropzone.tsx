"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function UploadDropzone({ projectId }: { projectId: string }) {
  const t = useTranslations("uploadDropzone");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFile(file: File) {
    if (file.type !== "application/pdf") {
      toast.error(t("invalidFileType"));
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("file", file);

    const response = await fetch("/api/uploads/pdf", {
      method: "POST",
      body: formData,
    });

    setIsUploading(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? t("uploadFailed"));
      return;
    }

    const { uploadId } = await response.json();
    toast.success(t("uploadStarted"));
    router.push(`/projects/${projectId}/uploads/${uploadId}`);
    router.refresh();
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
          e.target.value = "";
        }}
      />

      {isUploading ? (
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      ) : (
        <UploadCloud className="size-6 text-muted-foreground" />
      )}

      <p className="text-sm font-medium">
        {isUploading ? t("uploading") : t("instructions")}
      </p>
      <p className="text-xs text-muted-foreground">{t("maxSize", { size: 50 })}</p>
    </div>
  );
}
