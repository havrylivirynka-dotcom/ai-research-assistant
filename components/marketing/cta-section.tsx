import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function CtaSection() {
  const t = await getTranslations("cta");

  return (
    <section className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
        <Button size="lg" className="mt-8" asChild>
          <Link href="/register">
            {t("button")}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
