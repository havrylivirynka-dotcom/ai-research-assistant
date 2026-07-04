"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function WorkspaceNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const t = useTranslations("workspaceNav");
  const base = `/projects/${projectId}`;

  const tabs = [
    { href: base, label: t("overview") },
    { href: `${base}/chat`, label: t("aiChat") },
    { href: `${base}/bibliography`, label: t("bibliography") },
    { href: `${base}/structure`, label: t("structure") },
  ];

  return (
    <nav className="flex gap-1 border-b border-border/60">
      {tabs.map((tab) => {
        const isActive =
          tab.href === base ? pathname === base : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
