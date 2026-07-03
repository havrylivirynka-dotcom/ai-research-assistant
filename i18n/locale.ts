export const LOCALES = ["uk", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "uk";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export const LOCALE_LABELS: Record<Locale, { flag: string; label: string }> = {
  uk: { flag: "🇺🇦", label: "Українська" },
  en: { flag: "🇺🇸", label: "English" },
};
