import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectBibliographySummary({
  projectId,
  count,
  duplicateCount,
}: {
  projectId: string;
  count: number;
  duplicateCount: number;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Bibliography</CardTitle>
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
                {count} reference{count === 1 ? "" : "s"}
              </p>
              {duplicateCount > 0 && (
                <p className="text-xs text-destructive">
                  {duplicateCount} possible duplicate
                  {duplicateCount === 1 ? "" : "s"}
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
