"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
};

type UserSettings = {
  theme: string;
  language: string;
  plan: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SettingsForm({
  profile,
  settings,
}: {
  profile: Profile;
  settings: UserSettings;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [language, setLanguage] = useState(settings.language);
  const [theme, setThemeValue] = useState(settings.theme);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const supabase = createClient();
    const path = `${profile.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error(t("avatarUploadError"));
      setIsUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setIsUploadingAvatar(false);
  }

  async function handleSave() {
    setIsSaving(true);

    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        avatarUrl: avatarUrl ?? undefined,
        theme,
        language,
      }),
    });

    setIsSaving(false);

    if (!response.ok) {
      toast.error(t("saveError"));
      return;
    }

    setTheme(theme);
    toast.success(t("saveSuccess"));
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {t("profileSection")}
        </h2>

        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>{initials(fullName || profile.email)}</AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? t("uploadingAvatar") : t("changeAvatar")}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">{t("fullNameLabel")}</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input id="email" value={profile.email} disabled />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {t("preferencesSection")}
        </h2>

        <div className="space-y-2">
          <Label htmlFor="theme">{t("themeLabel")}</Label>
          <Select value={theme} onValueChange={setThemeValue}>
            <SelectTrigger id="theme" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t("themeLight")}</SelectItem>
              <SelectItem value="dark">{t("themeDark")}</SelectItem>
              <SelectItem value="system">{t("themeSystem")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">{t("languageLabel")}</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uk">{t("languageUk")}</SelectItem>
              <SelectItem value="en">{t("languageEn")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {t("planSection")}
        </h2>
        <p className="text-sm">
          {settings.plan === "premium" ? t("planPremium") : t("planFree")}
        </p>
      </section>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? tCommon("saving") : tCommon("saveChanges")}
      </Button>
    </div>
  );
}
