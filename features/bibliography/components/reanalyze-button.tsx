"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ReanalyzeButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const t = useTranslations("reanalyzeButton");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleClick() {
    setIsAnalyzing(true);

    const response = await fetch("/api/bibliography/reanalyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });

    setIsAnalyzing(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? t("errorFallback"));
      return;
    }

    toast.success(t("successToast"));
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isAnalyzing}>
      {isAnalyzing ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Sparkles className="size-4" />
      )}
      {isAnalyzing ? t("analyzing") : t("label")}
    </Button>
  );
}
