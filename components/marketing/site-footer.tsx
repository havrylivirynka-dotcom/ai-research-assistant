import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  const productLinks = [
    { href: "#features", label: t("productLinks.features") },
    { href: "#how-it-works", label: t("productLinks.howItWorks") },
    { href: "#ai-capabilities", label: t("productLinks.aiCapabilities") },
    { href: "#faq", label: t("productLinks.faq") },
  ];

  const accountLinks = [
    { href: "/login", label: t("accountLinks.signIn") },
    { href: "/register", label: t("accountLinks.createAccount") },
  ];

  return (
    <footer className="py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span>AI Research Assistant</span>
        </div>

        <div className="flex gap-16">
          <div>
            <h3 className="text-sm font-semibold">
              {t("productHeading")}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              {t("accountHeading")}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-border/60 px-6 pt-6 text-xs text-muted-foreground">
        {t("copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
