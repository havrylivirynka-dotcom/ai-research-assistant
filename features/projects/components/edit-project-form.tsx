"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUSES } from "@/schemas/project";
import { STATUS_LABEL_KEYS } from "@/features/projects/status";
import type { Database } from "@/types/database";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export function EditProjectForm({ project }: { project: Project }) {
  const router = useRouter();
  const t = useTranslations("editProjectForm");
  const tCommon = useTranslations("common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState(project.status);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        topic: formData.get("topic"),
        scienceField: formData.get("scienceField"),
        description: formData.get("description"),
        status,
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error?.message ?? t("genericError"));
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">{t("titleLabel")}</Label>
        <Input id="title" name="title" defaultValue={project.title} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="topic">{t("topicLabel")}</Label>
          <Input id="topic" name="topic" defaultValue={project.topic ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scienceField">{t("scienceFieldLabel")}</Label>
          <Input
            id="scienceField"
            name="scienceField"
            defaultValue={project.science_field ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">{t("statusLabel")}</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {tCommon(STATUS_LABEL_KEYS[value] as Parameters<typeof tCommon>[0])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("notesLabel")}</Label>
        <Textarea
          id="description"
          name="description"
          rows={8}
          defaultValue={project.description ?? ""}
          placeholder={t("notesPlaceholder")}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("saving") : t("save")}
        </Button>
        {saved && (
          <span className="text-sm text-muted-foreground">{t("saved")}</span>
        )}
      </div>
    </form>
  );
}
