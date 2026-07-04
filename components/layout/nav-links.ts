import {
  LayoutDashboard,
  FolderKanban,
  Search,
  MessagesSquare,
  BookMarked,
  ListChecks,
  Upload,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  href: string;
  labelKey:
    | "dashboard"
    | "projects"
    | "scientificSearch"
    | "aiAssistant"
    | "library"
    | "bibliography"
    | "uploads"
    | "settings";
  icon: LucideIcon;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/projects", labelKey: "projects", icon: FolderKanban },
  { href: "/search", labelKey: "scientificSearch", icon: Search },
  { href: "/chat", labelKey: "aiAssistant", icon: MessagesSquare },
  { href: "/library", labelKey: "library", icon: BookMarked },
  { href: "/bibliography", labelKey: "bibliography", icon: ListChecks },
  { href: "/uploads", labelKey: "uploads", icon: Upload },
  { href: "/settings", labelKey: "settings", icon: Settings },
];
