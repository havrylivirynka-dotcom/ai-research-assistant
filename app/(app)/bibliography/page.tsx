import type { Metadata } from "next";
import Link from "next/link";
import { ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listProjects } from "@/features/projects/queries";

export const metadata: Metadata = { title: "Bibliography" };

export default async function BibliographyPage() {
  const supabase = await createClient();
  const { data: projects } = await listProjects(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bibliography
        </h1>
        <p className="text-muted-foreground">
          Choose a project to manage and check its bibliography.
        </p>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/bibliography`}
              className="flex items-center gap-3 rounded-xl border border-border/60 p-4 hover:border-primary/40"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ListChecks className="size-4" />
              </div>
              <span className="truncate text-sm font-medium">
                {project.title}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ListChecks className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">No projects yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create a project first, then manage its bibliography here.
          </p>
          <Link
            href="/projects"
            className="mt-6 text-sm font-medium text-primary hover:underline"
          >
            Go to projects
          </Link>
        </div>
      )}
    </div>
  );
}
