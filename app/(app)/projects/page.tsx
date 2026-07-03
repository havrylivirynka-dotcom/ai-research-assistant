import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listProjects } from "@/features/projects/queries";
import { ProjectCard } from "@/features/projects/components/project-card";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await listProjects(supabase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Every research project you&apos;re working on, in one place.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FolderKanban className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">No projects yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first project to start searching literature,
            evaluating sources and building your bibliography.
          </p>
          <div className="mt-6">
            <CreateProjectDialog />
          </div>
        </div>
      )}
    </div>
  );
}
