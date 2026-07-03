import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProject } from "@/features/projects/queries";
import { StructureGenerator } from "@/features/structure/components/structure-generator";
import { WorkspaceNav } from "@/features/projects/components/workspace-nav";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await getProject(supabase, id);
  return {
    title: project ? `Structure · ${project.title}` : "Research Structure",
  };
}

export default async function ProjectStructurePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project, error } = await getProject(supabase, id);

  if (error || !project) {
    notFound();
  }

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

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Research Structure
        </h1>
        <p className="text-muted-foreground">
          Generate a logical outline to guide your writing — it won&apos;t
          write the paper for you.
        </p>
      </div>

      <StructureGenerator
        projectId={id}
        defaultTopic={project.topic || project.title}
      />
    </div>
  );
}
