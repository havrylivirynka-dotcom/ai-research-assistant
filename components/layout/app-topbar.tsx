import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export function AppTopbar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <div className="flex-1" />
      <LanguageSwitcher />
      <ThemeToggle />
    </header>
  );
}
