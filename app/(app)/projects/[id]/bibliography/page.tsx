import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ListChecks } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getProject } from "@/features/projects/queries";
import { listBibliography } from "@/features/bibliography/queries";
import { ImportBibliographyDialog } from "@/features/bibliography/components/import-bibliography-dialog";
import { AddReferenceDialog } from "@/features/bibliography/components/add-reference-dialog";
import { ReanalyzeButton } from "@/features/bibliography/components/reanalyze-button";
import { ExportButton } from "@/features/bibliography/components/export-button";
import { ReferenceRow } from "@/features/bibliography/components/reference-row";
import { WorkspaceNav } from "@/features/projects/components/workspace-nav";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await getProject(supabase, id);
  return { title: project ? `Bibliography · ${project.title}` : "Bibliography" };
}

export default async function ProjectBibliographyPage({ params }: PageProps) {
  const t = await getTranslations("bibliography");
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: project, error }, { data: references }] = await Promise.all([
    getProject(supabase, id),
    listBibliography(supabase, id),
  ]);

  if (error || !project) {
    notFound();
  }

  const items = references ?? [];
  const duplicateCount = items.filter(
    (ref) => (ref.ai_analysis as { isDuplicate?: boolean } | null)?.isDuplicate,
  ).length;

  return (
    <div className="space-y-6">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {project.title}
      </Link>

      <WorkspaceNav projectId={id} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("referencesCount", { count: items.length })}
            {duplicateCount > 0 &&
              ` · ${t("possibleDuplicatesCount", { count: duplicateCount })}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddReferenceDialog projectId={id} />
          <ImportBibliographyDialog projectId={id} />
          {items.length > 0 && (
            <>
              <ReanalyzeButton projectId={id} />
              <ExportButton references={items} projectTitle={project.title} />
            </>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ListChecks className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">{t("emptyTitle")}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 px-4">
          {items.map((reference, index) => (
            <ReferenceRow key={reference.id} reference={reference} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
