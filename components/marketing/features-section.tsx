import {
  Search,
  ShieldCheck,
  FileText,
  ListChecks,
  MessagesSquare,
  BookMarked,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURE_KEYS = [
  { icon: Search, key: "search" },
  { icon: ShieldCheck, key: "evaluation" },
  { icon: FileText, key: "pdfAnalyzer" },
  { icon: ListChecks, key: "bibliography" },
  { icon: MessagesSquare, key: "assistant" },
  { icon: BookMarked, key: "library" },
] as const;

export async function FeaturesSection() {
  const t = await getTranslations("features");

  return (
    <section id="features" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_KEYS.map((feature) => (
            <Card key={feature.key} className="border-border/60">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="mt-3">
                  {t(`${feature.key}.title`)}
                </CardTitle>
                <CardDescription>
                  {t(`${feature.key}.description`)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
