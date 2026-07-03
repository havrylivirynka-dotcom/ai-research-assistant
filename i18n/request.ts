import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "./locale";

/**
 * Each file's top-level keys become translation namespaces (e.g.
 * `useTranslations("projects")`). Split by feature area so unrelated
 * changes never touch the same file.
 */
const NAMESPACE_FILES = [
  "core",
  "landing",
  "auth",
  "dashboard",
  "sidebar",
  "projects",
  "search",
  "articles",
  "bibliography",
  "uploads",
  "settings",
  "usage",
  "library",
  "chat",
  "structure",
] as const;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  const modules = await Promise.all(
    NAMESPACE_FILES.map(
      (namespace) => import(`../messages/${locale}/${namespace}.json`),
    ),
  );

  const messages = Object.assign(
    {},
    ...modules.map((module) => module.default),
  );

  return { locale, messages };
});
