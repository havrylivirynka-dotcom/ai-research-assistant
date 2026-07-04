import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/features/settings/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: settings }, t] = await Promise.all([
    supabase.from("users").select("*").eq("id", user!.id).single(),
    supabase.from("user_settings").select("*").eq("user_id", user!.id).single(),
    getTranslations("settings"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {profile && settings && (
        <SettingsForm profile={profile} settings={settings} />
      )}
    </div>
  );
}
