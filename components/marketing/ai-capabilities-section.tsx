import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

const PRINCIPLE_KEYS = [
  "principle1",
  "principle2",
  "principle3",
  "principle4",
  "principle5",
  "principle6",
] as const;

export async function AiCapabilitiesSection() {
  const t = await getTranslations("aiCapabilities");

  return (
    <section id="ai-capabilities" className="border-b border-border/60 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <ul className="space-y-4">
          {PRINCIPLE_KEYS.map((key) => (
            <li key={key} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Check className="size-3.5" />
              </span>
              <span className="text-sm text-foreground/90">{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
