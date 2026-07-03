"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { NormalizedArticle } from "@/types/search";

type Project = { id: string; title: string };

export function SaveToProjectDialog({
  article,
}: {
  article: NormalizedArticle;
}) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setProjects(null);
    fetch("/api/projects")
      .then((res) => res.json())
      .then((body) => setProjects(body.projects ?? []))
      .catch(() => setProjects([]));
  }, [open]);

  async function handleSave(projectId: string) {
    setSavingId(projectId);

    const response = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        title: article.title,
        authors: article.authors,
        abstract: article.abstract,
        doi: article.doi,
        journal: article.journal,
        publisher: article.publisher,
        publicationYear: article.publicationYear,
        citations: article.citations,
        url: article.url,
      }),
    });

    setSavingId(null);

    if (response.ok) {
      toast.success("Saved to project.");
      setOpen(false);
    } else {
      toast.error("Could not save this article.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bookmark className="size-4" />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to project</DialogTitle>
          <DialogDescription>
            Choose which project this source belongs to.
          </DialogDescription>
        </DialogHeader>

        {projects === null ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            You don&apos;t have any projects yet.{" "}
            <Link href="/projects" className="font-medium text-foreground">
              Create one
            </Link>{" "}
            first.
          </p>
        ) : (
          <ul className="max-h-72 space-y-1 overflow-y-auto">
            {projects.map((project) => (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => handleSave(project.id)}
                  disabled={savingId !== null}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
                >
                  <span className="truncate">{project.title}</span>
                  {savingId === project.id && (
                    <Loader2 className="size-4 shrink-0 animate-spin" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
