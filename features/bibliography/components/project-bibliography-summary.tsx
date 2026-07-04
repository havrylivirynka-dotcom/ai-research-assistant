import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function ProjectBibliographySummary({
  projectId,
  count,
  duplicateCount,
}: {
  projectId: string;
  count: number;
  duplicateCount: number;
}) {
  const t = await getTranslations("bibliography");

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Link
          href={`/projects/${projectId}/bibliography`}
          className="flex items-center justify-between gap-3 rounded-md p-2 -mx-2 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ListChecks className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {t("referencesCount", { count })}
              </p>
              {duplicateCount > 0 && (
                <p className="text-xs text-destructive">
                  {t("possibleDuplicatesCount", { count: duplicateCount })}
                </p>
              )}
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground" />
        </Link>
      </CardContent>
    </Card>
  );
}
