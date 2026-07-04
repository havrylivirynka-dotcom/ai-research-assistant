import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectStatusBadge } from "./project-status-badge";
import type { Database } from "@/types/database";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export async function ProjectCard({ project }: { project: Project }) {
  const t = await getTranslations("projects");

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full border-border/60 transition-colors hover:border-primary/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="size-5" />
            </div>
            <ProjectStatusBadge status={project.status} />
          </div>
          <CardTitle className="mt-2 line-clamp-1">{project.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {project.topic || project.description || t("noTopic")}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
