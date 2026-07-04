"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { ResearchStructure } from "@/lib/ai/schemas";

function formatStructureAsText(
  structure: ResearchStructure,
  labels: {
    introduction: string;
    chapter: (number: number, title: string) => string;
    conclusion: string;
    appendices: string;
  },
): string {
  const lines: string[] = [];
  lines.push(labels.introduction.toUpperCase());
  lines.push(structure.introduction, "");

  structure.chapters.forEach((chapter, index) => {
    lines.push(labels.chapter(index + 1, chapter.title).toUpperCase());
    chapter.subsections.forEach((sub) => lines.push(`  - ${sub}`));
    lines.push("");
  });

  lines.push(labels.conclusion.toUpperCase());
  lines.push(structure.conclusion, "");

  if (structure.appendices.length > 0) {
    lines.push(labels.appendices.toUpperCase());
    structure.appendices.forEach((a) => lines.push(`  - ${a}`));
  }

  return lines.join("\n");
}

export function StructureGenerator({
  projectId,
  defaultTopic,
}: {
  projectId: string;
  defaultTopic: string;
}) {
  const t = useTranslations("structure");
  const router = useRouter();
  const [topic, setTopic] = useState(defaultTopic);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [structure, setStructure] = useState<ResearchStructure | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setStructure(null);

    const response = await fetch("/api/research/structure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });

    setIsGenerating(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? t("generateFailed"));
      return;
    }

    const body = await response.json();
    setStructure(body.structure);
  }

  async function handleCopyToNotes() {
    if (!structure) return;
    setIsSaving(true);

    const projectRes = await fetch(`/api/projects/${projectId}`);
    const { project } = await projectRes.json();
    const existingNotes = project?.description ?? "";
    const outlineText = formatStructureAsText(structure, {
      introduction: t("introductionHeading"),
      chapter: (number, title) => t("chapterHeading", { number, title }),
      conclusion: t("conclusionHeading"),
      appendices: t("appendicesHeading"),
    });
    const updatedNotes = existingNotes
      ? `${existingNotes}\n\n--- Generated outline ---\n\n${outlineText}`
      : outlineText;

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: updatedNotes }),
    });

    setIsSaving(false);

    if (!response.ok) {
      toast.error(t("saveFailed"));
      return;
    }

    toast.success(t("saveSucceeded"));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="topic">{t("topicLabel")}</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t("topicPlaceholder")}
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || topic.trim().length < 3}
        >
          {isGenerating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {isGenerating ? t("generating") : t("generateButton")}
        </Button>
      </div>

      {structure && (
        <Card className="border-border/60">
          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="font-semibold">{t("introductionHeading")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {structure.introduction}
              </p>
            </div>

            {structure.chapters.map((chapter, index) => (
              <div key={index}>
                <h3 className="font-semibold">
                  {t("chapterHeading", {
                    number: index + 1,
                    title: chapter.title,
                  })}
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  {chapter.subsections.map((sub) => (
                    <li key={sub}>{sub}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="font-semibold">{t("conclusionHeading")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {structure.conclusion}
              </p>
            </div>

            {structure.appendices.length > 0 && (
              <div>
                <h3 className="font-semibold">{t("appendicesHeading")}</h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  {structure.appendices.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button variant="outline" onClick={handleCopyToNotes} disabled={isSaving}>
              <ClipboardCopy className="size-4" />
              {isSaving ? t("saving") : t("addToNotes")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
