import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function HeroSection() {
  const t = await getTranslations("hero");

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground">
          <Sparkles className="size-3.5 text-primary" />
          {t("badge")}
        </div>

        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
          {t("title")}
        </h1>

        <p className="max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
          {t("subtitle")}
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">
              {t("ctaPrimary")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#how-it-works">{t("ctaSecondary")}</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">{t("footnote")}</p>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-primary/8 via-transparent to-transparent"
      />
    </section>
  );
}
