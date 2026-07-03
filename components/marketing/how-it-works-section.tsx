import { getTranslations } from "next-intl/server";

const STEP_KEYS = ["step1", "step2", "step3", "step4"] as const;

export async function HowItWorksSection() {
  const t = await getTranslations("howItWorks");

  return (
    <section id="how-it-works" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEP_KEYS.map((key, index) => (
            <div key={key}>
              <span className="text-sm font-mono font-semibold text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg font-semibold">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
