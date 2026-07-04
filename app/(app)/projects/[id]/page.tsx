import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getProject } from "@/features/projects/queries";
import { listSavedArticles } from "@/features/articles/queries";
import { listUploads } from "@/features/uploads/queries";
import { listBibliography } from "@/features/bibliography/queries";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { DeleteProjectButton } from "@/features/projects/components/delete-project-button";
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import { ProjectSourcesList } from "@/features/articles/components/project-sources-list";
import { ProjectUploadsList } from "@/features/uploads/components/project-uploads-list";
import { ProjectBibliographySummary } from "@/features/bibliography/components/project-bibliography-summary";
import { WorkspaceNav } from "@/features/projects/components/workspace-nav";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await getProject(supabase, id);
  return { title: project?.title ?? "Project" };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [
    { data: project, error },
    { data: articles },
    { data: uploads },
    { data: bibliography },
  ] = await Promise.all([
    getProject(supabase, id),
    listSavedArticles(supabase, id),
    listUploads(supabase, id),
    listBibliography(supabase, id),
  ]);

  if (error || !project) {
    notFound();
  }

  const t = await getTranslations("projectDetail");
  const bibliographyItems = bibliography ?? [];
  const duplicateCount = bibliographyItems.filter(
    (ref) => (ref.ai_analysis as { isDuplicate?: boolean } | null)?.isDuplicate,
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("backToProjects")}
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.title}
            </h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("createdOn", {
              date: new Date(project.created_at).toLocaleDateString(),
            })}
          </p>
        </div>
        <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
      </div>

      <WorkspaceNav projectId={project.id} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <EditProjectForm project={project} />
        <div className="space-y-6">
          <ProjectSourcesList projectId={project.id} articles={articles ?? []} />
          <ProjectBibliographySummary
            projectId={project.id}
            count={bibliographyItems.length}
            duplicateCount={duplicateCount}
          />
          <ProjectUploadsList projectId={project.id} uploads={uploads ?? []} />
        </div>
      </div>
    </div>
  );
}
