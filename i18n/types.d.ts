import type core from "@/messages/uk/core.json";
import type landing from "@/messages/uk/landing.json";
import type auth from "@/messages/uk/auth.json";
import type dashboard from "@/messages/uk/dashboard.json";
import type sidebar from "@/messages/uk/sidebar.json";
import type projects from "@/messages/uk/projects.json";
import type search from "@/messages/uk/search.json";
import type articles from "@/messages/uk/articles.json";
import type bibliography from "@/messages/uk/bibliography.json";
import type uploads from "@/messages/uk/uploads.json";
import type settings from "@/messages/uk/settings.json";
import type usage from "@/messages/uk/usage.json";
import type library from "@/messages/uk/library.json";
import type chat from "@/messages/uk/chat.json";
import type structure from "@/messages/uk/structure.json";
import type { Locale } from "./locale";

type Messages = typeof core &
  typeof landing &
  typeof auth &
  typeof dashboard &
  typeof sidebar &
  typeof projects &
  typeof search &
  typeof articles &
  typeof bibliography &
  typeof uploads &
  typeof settings &
  typeof usage &
  typeof library &
  typeof chat &
  typeof structure;

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
