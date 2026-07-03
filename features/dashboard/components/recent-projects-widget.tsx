import Link from "next/link";
import { WidgetCard, WidgetEmptyState } from "./widget-card";
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import type { Database } from "@/types/database";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export function RecentProjectsWidget({ projects }: { projects: Project[] }) {
  return (
    <WidgetCard title="Recent projects" viewAllHref="/projects">
      {projects.length === 0 ? (
        <WidgetEmptyState message="No projects yet. Create one to get started." />
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate font-medium">{project.title}</span>
                <ProjectStatusBadge status={project.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
