import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getRecentProjects,
  getRecentSavedArticles,
  getRecentSearches,
  getRecentUploads,
  getUsageSummary,
} from "@/features/dashboard/queries";
import { RecentProjectsWidget } from "@/features/dashboard/components/recent-projects-widget";
import { SavedArticlesWidget } from "@/features/dashboard/components/saved-articles-widget";
import { AiUsageWidget } from "@/features/dashboard/components/ai-usage-widget";
import { RecentSearchesWidget } from "@/features/dashboard/components/recent-searches-widget";
import { UploadStatusWidget } from "@/features/dashboard/components/upload-status-widget";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    { data: projects },
    { data: articles },
    { data: searches },
    { data: uploads },
    usage,
  ] = await Promise.all([
    supabase.from("users").select("full_name").eq("id", user!.id).single(),
    getRecentProjects(supabase),
    getRecentSavedArticles(supabase),
    getRecentSearches(supabase),
    getRecentUploads(supabase),
    getUsageSummary(supabase),
  ]);

  const firstName = (profile?.full_name || "there").split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome, {firstName}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening across your research.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecentProjectsWidget projects={projects ?? []} />
        <SavedArticlesWidget articles={articles ?? []} />
        <RecentSearchesWidget searches={searches ?? []} />
        <UploadStatusWidget uploads={uploads ?? []} />
        <div className="md:col-span-2">
          <AiUsageWidget usage={usage} />
        </div>
      </div>
    </div>
  );
}
