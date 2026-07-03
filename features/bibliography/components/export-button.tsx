"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type BibliographyRow = Database["public"]["Tables"]["bibliography"]["Row"];

export function ExportButton({
  references,
  projectTitle,
}: {
  references: BibliographyRow[];
  projectTitle: string;
}) {
  function handleExport() {
    const content = references
      .map((ref, index) => `${index + 1}. ${ref.reference_text}`)
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-bibliography.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={references.length === 0}
    >
      <Download className="size-4" />
      Export
    </Button>
  );
}
