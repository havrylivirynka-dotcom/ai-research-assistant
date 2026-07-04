"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { Database } from "@/types/database";
import type { PdfAnalysis } from "@/lib/ai/schemas";

type Upload = Database["public"]["Tables"]["uploads"]["Row"];

const POLL_INTERVAL_MS = 3000;

export function UploadDetail({ initialUpload }: { initialUpload: Upload }) {
  const t = useTranslations("uploadDetail");
  const [upload, setUpload] = useState(initialUpload);

  useEffect(() => {
    if (upload.status !== "processing") return;

    const interval = setInterval(async () => {
      const response = await fetch(`/api/uploads/${upload.id}`);
      if (!response.ok) return;
      const { upload: fresh } = await response.json();
      setUpload(fresh);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [upload.status, upload.id]);

  if (upload.status === "processing") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("analyzing")}</p>
      </div>
    );
  }

  if (upload.status === "failed") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 py-16 text-center">
        <AlertTriangle className="size-6 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {t("analysisFailed")}
        </p>
      </div>
    );
  }

  const analysis = upload.ai_analysis as PdfAnalysis | null;

  if (!analysis) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("noAnalysisAvailable")}
      </p>
    );
  }

  return (
    <Tabs defaultValue="summary">
      <TabsList>
        <TabsTrigger value="summary">{t("summaryTab")}</TabsTrigger>
        <TabsTrigger value="findings">{t("findingsTab")}</TabsTrigger>
        <TabsTrigger value="strengths">{t("strengthsTab")}</TabsTrigger>
        <TabsTrigger value="citations">{t("citationsTab")}</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="max-w-2xl space-y-4">
        <p className="text-sm leading-relaxed text-foreground/90">
          {analysis.summary}
        </p>
        {analysis.keyContributions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium">{t("keyContributions")}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {analysis.keyContributions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {analysis.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="findings" className="max-w-2xl space-y-4">
        <div>
          <h3 className="text-sm font-medium">{t("methods")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {analysis.methods || t("notDescribed")}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium">{t("findings")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {analysis.findings || t("notDescribed")}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium">{t("conclusions")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {analysis.conclusions || t("notDescribed")}
          </p>
        </div>
      </TabsContent>

      <TabsContent value="strengths" className="max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium">{t("strengths")}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {analysis.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium">{t("weaknesses")}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {analysis.weaknesses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium">{t("limitations")}</h3>
            {analysis.limitations.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {t("noLimitationsStated")}
              </p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {analysis.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="citations" className="max-w-2xl">
        {analysis.possibleCitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("noCitationSuggestions")}
          </p>
        ) : (
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {analysis.possibleCitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}
