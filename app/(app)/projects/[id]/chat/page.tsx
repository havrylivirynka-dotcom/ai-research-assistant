import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProject } from "@/features/projects/queries";
import { listChats } from "@/features/chat/queries";
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";
import { WorkspaceNav } from "@/features/projects/components/workspace-nav";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await getProject(supabase, id);
  return { title: project ? `AI Assistant · ${project.title}` : "AI Assistant" };
}

export default async function ProjectChatPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: project, error }, { data: chats }] = await Promise.all([
    getProject(supabase, id),
    listChats(supabase, id),
  ]);

  if (error || !project) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {project.title}
      </Link>

      <WorkspaceNav projectId={id} />

      <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>

      <ChatWorkspace projectId={id} initialChats={chats ?? []} />
    </div>
  );
}
