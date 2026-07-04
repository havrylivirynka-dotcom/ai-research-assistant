"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ImportBibliographyDialog({ projectId }: { projectId: string }) {
  const router = useRouter();
  const t = useTranslations("importBibliographyDialog");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("paste");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [text, setText] = useState("");

  async function submit(formData: FormData) {
    formData.set("projectId", projectId);
    setIsSubmitting(true);

    const response = await fetch("/api/bibliography/analyze", {
      method: "POST",
      body: formData,
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? t("errorFallback"));
      return;
    }

    const body = await response.json();
    toast.success(
      body.analysis
        ? t("successWithAnalysis", { count: body.imported })
        : t("successWithoutAnalysis", { count: body.imported }),
    );
    setOpen(false);
    setText("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="size-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="paste">{t("tabPaste")}</TabsTrigger>
              <TabsTrigger value="file">{t("tabFile")}</TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="references">{t("referencesLabel")}</Label>
                <Textarea
                  id="references"
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("referencesPlaceholder")}
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bibFile">{t("fileLabel")}</Label>
                <input
                  id="bibFile"
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  className="block w-full text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.set("file", file);
                    submit(formData);
                  }}
                  disabled={isSubmitting}
                />
                {isSubmitting && (
                  <p className="text-sm text-muted-foreground">
                    {t("importingAndAnalyzing")}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {tab === "paste" && (
          <DialogFooter className="shrink-0 mx-0 mb-0 rounded-b-xl border-t bg-muted/50 px-6 py-4">
            <Button
              disabled={isSubmitting || text.trim().length < 10}
              onClick={() => {
                const formData = new FormData();
                formData.set("text", text);
                submit(formData);
              }}
            >
              {isSubmitting ? t("importing") : t("submit")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
