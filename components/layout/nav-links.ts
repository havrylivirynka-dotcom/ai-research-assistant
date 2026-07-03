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
  label: string;
  icon: LucideIcon;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/search", label: "Scientific Search", icon: Search },
  { href: "/chat", label: "AI Assistant", icon: MessagesSquare },
  { href: "/library", label: "Library", icon: BookMarked },
  { href: "/bibliography", label: "Bibliography", icon: ListChecks },
  { href: "/uploads", label: "Uploads", icon: Upload },
  { href: "/settings", label: "Settings", icon: Settings },
];
